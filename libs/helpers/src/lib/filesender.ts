"use strict";

// @ts-ignore
import hashtable from "alib-hashtable";
import { encodeChunkWithHeader } from "rtc-client";

const RTC_MAX_MESSAGE = 262_144;
const HEADER_OVERHEAD = 256;
const BASE_CHUNK_SIZE = RTC_MAX_MESSAGE - HEADER_OVERHEAD;
const INITIAL_BIG_SLICE = 512_000;
const MIN_BIG_SLICE = 64_000;
const MAX_BIG_SLICE = 4_194_304;
const BUFFER_MAX = 524_288;
const LOW_BYTES_PER_SEC = 2_000_000;
const HIGH_BYTES_PER_SEC = 8_000_000;

function readAsArrayBufferAsync(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

type RequestState = {
  requestID: number;
  cancel: boolean;
  paused: boolean;
  resumeFn: (() => void) | null;
};

export const filesender = () => {
  const requests = hashtable("requestID");

  function sendFile(
    file: File,
    requestID: number,
    range: { startPos: number; endPos: number },
    rtcSend: (message: ArrayBuffer) => void,
    rtcBufferedAmount: () => number | null,
    uploadUpdateCallback: (percent: number) => void,
    uploadFinishedCallback: () => void
  ) {
    requests.set({
      requestID,
      cancel: false,
      paused: false,
      resumeFn: null,
    } as RequestState);

    console.log("SEND FILE:", { requestID, range });

    const rangeStart = range.startPos;
    const endPos = range.endPos;
    const rangeBytes = Math.max(endPos - rangeStart, 1);

    let start = rangeStart;
    let end = 0;
    let percentSent = -1;
    let THB: ReturnType<typeof setTimeout> | null = null;

    let bigSliceSize = INITIAL_BIG_SLICE;
    let byteHistory: { t: number; bytes: number }[] = [];

    let sendingQueue: Uint8Array[] = [];
    let queuePointer = 0;

    const getRequest = () => requests.get(requestID) as RequestState | undefined;
    const isCancelled = () => getRequest()?.cancel === true;
    const isPaused = () => getRequest()?.paused === true;

    const clearTimer = () => {
      if (THB !== null) {
        clearTimeout(THB);
        THB = null;
      }
    };

    const schedule = (fn: () => void, delay = 10) => {
      clearTimer();
      THB = setTimeout(fn, delay);
    };

    const updateProgress = () => {
      let percentage = Math.floor(((end - rangeStart) / rangeBytes) * 100);
      if (percentage > 99) percentage = 99;

      if (percentSent !== percentage) {
        percentSent = percentage;
        uploadUpdateCallback(percentSent);
      }
    };

    const recordSlice = (bytesSent: number) => {
      const now = performance.now();
      byteHistory.push({ t: now, bytes: bytesSent });
      byteHistory = byteHistory.filter(entry => now - entry.t < 2000);

      const bytesPerSec = byteHistory.reduce((sum, entry) => sum + entry.bytes, 0) / 2;

      if (bytesPerSec < LOW_BYTES_PER_SEC) {
        bigSliceSize = Math.min(Math.floor(bigSliceSize * 1.5), MAX_BIG_SLICE);
      } else if (bytesPerSec > HIGH_BYTES_PER_SEC) {
        bigSliceSize = Math.max(Math.floor(bigSliceSize * 0.75), MIN_BIG_SLICE);
      }
    };

    const sendFileEnd = () => {
      rtcSend(
        encodeChunkWithHeader({
          type: "file-end",
          data: { requestID },
        })
      );
    };

    const finish = (success: boolean) => {
      clearTimer();
      requests.set({
        requestID,
        cancel: getRequest()?.cancel ?? false,
        paused: false,
        resumeFn: null,
      } as RequestState);

      if (success) {
        uploadUpdateCallback(100);
      }

      uploadFinishedCallback();
      sendFileEnd();
      console.log("EXIT!", { requestID, success });
    };

    const resumeTransfer = () => {
      if (isCancelled() || isPaused()) {
        return;
      }

      if (queuePointer < sendingQueue.length) {
        sendBinaryChunk();
      } else if (start < endPos) {
        readChunk();
      }
    };

    requests.set({
      requestID,
      cancel: false,
      paused: false,
      resumeFn: resumeTransfer,
    } as RequestState);

    function readChunk() {
      if (isCancelled()) {
        finish(false);
        return;
      }

      if (isPaused()) {
        schedule(readChunk, 25);
        return;
      }

      const buffered = rtcBufferedAmount();
      if (buffered === null || buffered >= BUFFER_MAX) {
        schedule(readChunk, 10);
        return;
      }

      if (start + bigSliceSize < endPos) {
        end = start + bigSliceSize;
      } else {
        end = endPos;
      }

      updateProgress();

      readAsArrayBufferAsync(file.slice(start, end))
        .then(arrayBuffer => {
          if (isCancelled()) {
            finish(false);
            return;
          }

          let offset = 0;
          const totalLength = arrayBuffer.byteLength;

          while (offset < totalLength) {
            const sliceEnd = Math.min(offset + BASE_CHUNK_SIZE, totalLength);
            sendingQueue.push(new Uint8Array(arrayBuffer, offset, sliceEnd - offset));
            offset = sliceEnd;
          }

          recordSlice(totalLength);
          start = end;
          sendBinaryChunk();
        })
        .catch(err => {
          console.error("Failed to read chunk:", err);
          finish(false);
        });
    }

    function sendBinaryChunk() {
      if (isCancelled()) {
        finish(false);
        return;
      }

      if (isPaused()) {
        schedule(sendBinaryChunk, 25);
        return;
      }

      while (queuePointer < sendingQueue.length && !isCancelled() && !isPaused()) {
        const buffered = rtcBufferedAmount();
        if (buffered === null || buffered >= BUFFER_MAX) {
          break;
        }

        const chunk = sendingQueue[queuePointer++];
        rtcSend(
          encodeChunkWithHeader(
            {
              type: "file-send",
              data: { requestID },
            },
            chunk
          )
        );
      }

      if (isCancelled()) {
        finish(false);
        return;
      }

      if (queuePointer >= sendingQueue.length && start < endPos) {
        sendingQueue = [];
        queuePointer = 0;
        schedule(readChunk, 0);
      } else if (start >= endPos && queuePointer >= sendingQueue.length) {
        finish(true);
      } else {
        schedule(sendBinaryChunk, 10);
      }
    }

    readChunk();
  }

  function cancelUpload(requestID: number) {
    console.log("cancelUpload! request sent");
    const existing = requests.get(requestID) as RequestState | undefined;
    requests.set({
      requestID,
      cancel: true,
      paused: existing?.paused ?? false,
      resumeFn: null,
    } as RequestState);
  }

  function pauseUpload(requestID: number) {
    const existing = requests.get(requestID) as RequestState | undefined;
    if (!existing) {
      return;
    }

    requests.set({
      requestID,
      cancel: existing.cancel,
      paused: true,
      resumeFn: existing.resumeFn,
    } as RequestState);
  }

  function resumeUpload(requestID: number) {
    const existing = requests.get(requestID) as RequestState | undefined;
    if (!existing?.paused) {
      return;
    }

    requests.set({
      requestID,
      cancel: existing.cancel,
      paused: false,
      resumeFn: existing.resumeFn,
    } as RequestState);

    existing.resumeFn?.();
  }

  function cancelAll() {
    const allRequests = requests.getCollection();
    allRequests.forEach((item: RequestState) => {
      requests.set({
        requestID: item.requestID,
        cancel: true,
        paused: item.paused,
        resumeFn: null,
      } as RequestState);
    });
  }

  return {
    sendFile,
    cancelUpload,
    pauseUpload,
    resumeUpload,
    cancelAll,
  };
};
