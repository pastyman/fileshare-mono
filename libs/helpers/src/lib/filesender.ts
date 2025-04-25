//@ts-ignore
import hashtable from "alib-hashtable";
import { encodeChunkWithHeader } from "rtc-client";

export const filesender = () => {
  "use strict";

  var FILE_SLICES = 48;
  var BINARY_CHUNK = 12000;
  var BINARY_BUFFER_MAX_LENGTH = 32;
  var BUFFER_MAX = 4384; // 16384 - 12000

  const requests = hashtable('requestID');

  function sendFile(
    file: File,
    requestID: number,
    range: { startPos: number, endPos: number },
    rtcSend: any,
    rtcBufferedAmount: any,
    uploadUpdateCallback: any,
    uploadFinishedCallback: any
  ) {
    requests.set({ requestID, cancel: false });

    console.log('SEND FILE');
    console.log('requestID', requestID);
    console.log('range', range);

    var endPos = range.endPos;
    var percentSent = -1;
    var start = range.startPos;
    var end = 0;
    var binaryBuffer: Uint8Array[] = [];
    var readPointer = 0;
    var percentage = 0;
    var reader = new FileReader();
    reader.onload = addToBuffer;
    var THB: any = null;

    const isCancelled = () => requests.get(requestID).cancel;

    console.log("file loaded...");
    uploadUpdateCallback(0);

    if (THB) {
      clearTimeout(THB);
      THB = null;
    }

    function readChunk() {
      if (rtcBufferedAmount() !== null && rtcBufferedAmount() < BUFFER_MAX && !isCancelled()) {
        if (start + (BINARY_CHUNK * FILE_SLICES) < endPos) {
          end = start + (BINARY_CHUNK * FILE_SLICES);
        } else {
          end = endPos;
        }

        percentage = Math.floor((end / endPos) * 100);
        if (percentage > 99) percentage = 99;

        if (percentSent !== percentage) {
          percentSent = percentage;
          uploadUpdateCallback(percentSent);
        }

        if (binaryBuffer.length - readPointer < BINARY_BUFFER_MAX_LENGTH) {
          setTimeout(() => reader.readAsArrayBuffer(file.slice(start, end)), 0);
        } else {
          sendBinaryChunk();
        }
      } else {
        if (!isCancelled() && rtcBufferedAmount() !== null) {
          THB = setTimeout(readChunk, 0);
        } else {
          uploadFinishedCallback();
        }
      }
    }

    function addToBuffer(evt: any) {
      // if (start < end) {
        const arrayBuffer = evt.target.result as ArrayBuffer;

          let offset = 0;
          const totalLength = arrayBuffer.byteLength;

          while (offset < totalLength) {
            const sliceEnd = Math.min(offset + BINARY_CHUNK, totalLength);
            const chunk = arrayBuffer.slice(offset, sliceEnd);
            binaryBuffer.push(new Uint8Array(chunk));
            offset = sliceEnd;
          }

      // }

      start = end;
      sendBinaryChunk();
    }

    function sendBinaryChunk() {
      if (readPointer < binaryBuffer.length) {
        const chunk = binaryBuffer[readPointer++];

        if (chunk) {
          const chunkBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
          const arrayBuffer = new Uint8Array(chunkBuffer).buffer;
          rtcSend(encodeChunkWithHeader({
            type: "file-send",
            data: { requestID }
          }, arrayBuffer));
        }
      }

      if (end === endPos && readPointer >= binaryBuffer.length) {
        finish();
      } else {
        THB = setTimeout(readChunk, 0);
      }

      // Reset buffer when consumed
      if (readPointer >= binaryBuffer.length && binaryBuffer.length > 0) {
        binaryBuffer = [];
        readPointer = 0;
      }
    }

    function finish() {
      uploadUpdateCallback(100);
      uploadFinishedCallback();

      rtcSend(encodeChunkWithHeader({
        type: "file-end",
        data: { requestID }
      }));

      console.log("EXIT!");
    }

    readChunk();
  }

  function cancelUpload(requestID: number) {
    console.log('cancelUpload ! request sent');
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
