//@ts-ignore
import hashtable from "alib-hashtable";
import { encodeChunkWithHeader } from "rtc-client";


export const filesender = () => {
  "use strict";

  var FILE_SLICES = 512;
  var BINARY_CHUNK = 9000;
  var BASE64_CHUNK = 12000;
  var BASE64_BUFFER = 32;
  //var BUFFER_MAX = 16384;
  var BUFFER_MAX = 4384 ///16384 - 12000 (BUFFER_MAX - BASE64_CHUNK)

  const requests = hashtable('requestID');

  function sendFile(file: File, requestID: number, range: { startPos: number, endPos: number }, rtcSend: any, rtcBufferedAmount: any, uploadUpdateCallback: any, uploadFinishedCallback: any) {
    requests.set({
      requestID,
      cancel: false
    });

    console.log('SEND FILE');
    console.log('requestID', requestID);
    console.log('range', range);

    var endPos = range.endPos;
    var percentSent = -1;
    var start = range.startPos;
    var end = 0;
    var binaryBuffer: Uint8Array[] = [];
    var percentage = 0;
    var reader = new FileReader();
    reader.onload = addToBuffer;
    var THB = null;

    const isCancelled = () => {
      return requests.get(requestID).cancel;
    }

    console.log("file loaded...");

    //raise pc change event
    uploadUpdateCallback(0);

    //clear any pending calls
    if (THB) {
      clearTimeout(THB);
      THB = null;
    }

    function readChunk() {
      //console.log('rtcBufferedAmount()' + rtcBufferedAmount());

      if ((rtcBufferedAmount() !== null) && rtcBufferedAmount() < BUFFER_MAX && isCancelled() === false) {
        //size of chunk to read
        if (start + (BINARY_CHUNK * FILE_SLICES) < endPos) {
          //big file read
          end = start + (BINARY_CHUNK * FILE_SLICES);
        }
        else {
          //small file read
          end = endPos;
        }

        //calc pc change
        percentage = Math.floor((end / endPos) * 100);
        if (percentage > 99) {
          percentage = 99;
        }
        if (percentSent !== percentage) {
          percentSent = percentage;
          //raise pc change event
          uploadUpdateCallback(percentSent);
        }


        //read or send from buffer
        if (binaryBuffer.length < BASE64_BUFFER) {
          //read and send
          reader.readAsArrayBuffer(file.slice(start, end))
        }
        else {
          //just send
          sendBinaryChunk();
        }
      }
      else {
        if (isCancelled() === false && rtcBufferedAmount() !== null) {
          THB = setTimeout(readChunk, 0);
        }
        else {
          uploadFinishedCallback();
        }
      }
    }

    function addToBuffer(evt: any) {
      if (start < end) {
        const arrayBuffer = evt.target.result as ArrayBuffer;

        if (end - start > BINARY_CHUNK) {
          // Large chunk, split into smaller pieces
          let offset = 0;
          const totalLength = arrayBuffer.byteLength;

          while (offset < totalLength) {
            const sliceEnd = Math.min(offset + BINARY_CHUNK, totalLength);
            const chunk = arrayBuffer.slice(offset, sliceEnd);
            binaryBuffer.push(new Uint8Array(chunk));
            offset = sliceEnd;
          }

        } else {
          // Small enough, push directly
          binaryBuffer.push(new Uint8Array(arrayBuffer));
        }
      }

      start = end;

      // Trigger your sending logic
      sendBinaryChunk();
    }

    function sendBinaryChunk() {
      if (binaryBuffer.length > 0) {
        const chunk = binaryBuffer.shift();

        if (chunk) {
          const chunkBuffer = chunk?.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
          const arrayBuffer = new Uint8Array(chunkBuffer).buffer;
          rtcSend(encodeChunkWithHeader({
            type: "file-send",
            data: {
              requestID
            }
            
          }, arrayBuffer));
        }
      }

      if (end === endPos && binaryBuffer.length === 0) {
        //all file chunks have been sent
        finish();
      }
      else {
        //go to next chunk
        THB = setTimeout(readChunk, 0);
        //readChunk();
      }
    }

    function finish() {
      //raise pc change event
      uploadUpdateCallback(100);

      //raise finish event
      uploadFinishedCallback();

      //send empty file chunk signifying end of file
      rtcSend(encodeChunkWithHeader({
        type: "file-end",
        data: {
          requestID
        }
      }));

      //rtcSend(JSON.stringify({ type: "end" }));

      console.log("EXIT!");
    }

    //kick off process!
    readChunk();
  }

  //force cancel send
  function cancelUpload(requestID: number) {
    console.log('cancelUpload ! request sent')

    requests.set({
      requestID,
      cancel: true
    });
  }

    //cancel all
    function cancelAll() {
      requests.forEach((value: any, key: any) => {
        requests.set({
          requestID: value.requestID,
          cancel: true
        });
      });
    }

  return {
    sendFile,
    cancelUpload,
    cancelAll
  };
}