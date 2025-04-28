"use strict";

// @ts-ignore
import hashtable from "alib-hashtable";
import { encodeChunkWithHeader } from "rtc-client";

function readAsArrayBufferAsync(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

export const filesender = () => {
  const BASE_CHUNK_SIZE = 12_000; // small chunk for RTC sending
  const INITIAL_BIG_SLICE = 512_000; // initial big slice (512KB)
  const MIN_BIG_SLICE = 64_000; // minimum big slice (64KB)
  const MAX_BIG_SLICE = 4_194_304; // maximum big slice (4MB)
  const BUFFER_MAX = 16_000; // rtcBufferedAmount threshold
  const LOW_SEND_RATE = 50; // below = slow sending
  const HIGH_SEND_RATE = 150; // above = fast sending

  const requests = hashtable("requestID");

  // Shared adaptive tuning state across all transfers
  let tunedBigSliceSize = INITIAL_BIG_SLICE;
  let tunedSendHistory: number[] = [];

  function sendFile(
    file: File,
    requestID: number,
    range: { startPos: number; endPos: number },
    rtcSend: any,
    rtcBufferedAmount: any,
    uploadUpdateCallback: any,
    uploadFinishedCallback: any
  ) {
    requests.set({ requestID, cancel: false });

    console.log("SEND FILE:", { requestID, range });

    let start = range.startPos;
    const endPos = range.endPos;
    let end = 0;

    let percentSent = -1;
    let percentage = 0;
    let THB: any = null;

    // Copy the tuned defaults
    let bigSliceSize = tunedBigSliceSize;
    let sendHistory: number[] = [...tunedSendHistory];

    let sendingQueue: Uint8Array[] = [];
    let queuePointer = 0;

    const isCancelled = () => requests.get(requestID)?.cancel === true;

    function recordSend() {
      const now = performance.now();
      sendHistory.push(now);
      sendHistory = sendHistory.filter(t => now - t < 2000); // Keep last 2 seconds

      const sendsPerSec = sendHistory.length / 2;

      // Adjust bigSliceSize adaptively
      if (sendsPerSec < LOW_SEND_RATE) {
        bigSliceSize = Math.min(bigSliceSize * 1.5, MAX_BIG_SLICE);
      } else if (sendsPerSec > HIGH_SEND_RATE) {
        bigSliceSize = Math.max(bigSliceSize * 0.75, MIN_BIG_SLICE);
      }

      // Update tuned defaults for future requests
      tunedBigSliceSize = bigSliceSize;
      tunedSendHistory = [...sendHistory];
    }

    function readChunk() {
      if (rtcBufferedAmount() !== null && rtcBufferedAmount() < BUFFER_MAX && !isCancelled()) {
        if (start + bigSliceSize < endPos) {
          end = start + bigSliceSize;
        } else {
          end = endPos;
        }

        percentage = Math.floor((end / endPos) * 100);
        if (percentage > 99) percentage = 99;

        if (percentSent !== percentage) {
          percentSent = percentage;
          uploadUpdateCallback(percentSent);
        }

        readAsArrayBufferAsync(file.slice(start, end))
          .then(arrayBuffer => {
            let offset = 0;
            const totalLength = arrayBuffer.byteLength;

            while (offset < totalLength) {
              const sliceEnd = Math.min(offset + BASE_CHUNK_SIZE, totalLength);
              const chunk = arrayBuffer.slice(offset, sliceEnd);
              sendingQueue.push(new Uint8Array(chunk));
              offset = sliceEnd;
            }

            start = end;
            sendBinaryChunk();
          })
          .catch(err => {
            console.error("Failed to read chunk:", err);
            finish();
          });
      } else {
        if (!isCancelled() && rtcBufferedAmount() !== null) {
          THB = setTimeout(readChunk, 10);
        } else {
          uploadFinishedCallback();
        }
      }
    }

    function sendBinaryChunk() {
      while (queuePointer < sendingQueue.length && rtcBufferedAmount() < BUFFER_MAX && !isCancelled()) {
        const chunk = sendingQueue[queuePointer++];

        if (chunk) {
          const chunkBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
          rtcSend(
            encodeChunkWithHeader(
              {
                type: "file-send",
                data: { requestID }
              },
              new Uint8Array(chunkBuffer).buffer
            )
          );
          recordSend();
        }
      }

      if (queuePointer >= sendingQueue.length && start < endPos) {
        // Finished current slice, read next
        sendingQueue = [];
        queuePointer = 0;
        THB = setTimeout(readChunk, 0);
      } else if (start >= endPos && queuePointer >= sendingQueue.length) {
        // Finished everything
        finish();
      } else {
        // Waiting for RTC buffer to clear
        THB = setTimeout(sendBinaryChunk, 10);
      }
    }

    function finish() {
      uploadUpdateCallback(100);
      uploadFinishedCallback();

      rtcSend(
        encodeChunkWithHeader({
          type: "file-end",
          data: { requestID }
        })
      );

      console.log("EXIT!");
    }

    readChunk();
  }

  function cancelUpload(requestID: number) {
    console.log("cancelUpload! request sent");
    requests.set({ requestID, cancel: true });
  }

  function cancelAll() {
    const allRequests = requests.getCollection();
    allRequests.forEach((item: any) => {
      requests.set({ requestID: item.requestID, cancel: true });
    });
  }

  return {
    sendFile,
    cancelUpload,
    cancelAll
  };
};
