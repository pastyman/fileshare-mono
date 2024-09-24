//@ts-ignore
import hashtable from "alib-hashtable";
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
    var base64Buffer: string[] = [];
    var base64Pos = 0;
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
        if ((base64Buffer.length - base64Pos) < BASE64_BUFFER) {
          //read and send
          reader.readAsDataURL(file.slice(start, end));

          // var buffer = new Buffer(end - start);
          // fs.read(file, buffer, 0, (end - start), start, function (e, l, b) {
          //   addToBuffer(b);
          // });

        }
        else {
          //just send
          sendBase64Chunk();
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
        //result of async reader output
        var base64Str = evt.target.result;
        base64Str = base64Str.substr(base64Str.indexOf(',') + 1);

        if (end - start > BINARY_CHUNK) {
          //big file chunk, slice up !
          var lStart = 0;
          var lEnd = 0;
          var chunkLength = base64Str.length;

          var done = false;
          while (done === false) {
            lEnd = lStart + BASE64_CHUNK;
            if (lEnd >= chunkLength) {
              lEnd = chunkLength;
              base64Buffer.push(base64Str.substring(lStart));
            }
            else {
              base64Buffer.push(base64Str.substring(lStart, lEnd));
            }

            //inc
            lStart = lEnd;

            if (lEnd === chunkLength) {
              done = true;
            }
          }

        }
        else {
          //standard file chunk
          base64Buffer.push(base64Str);
        }
      }

      //inc
      start = end;

      //send
      sendBase64Chunk();
    }

    function sendBase64Chunk() {
      if (base64Pos < base64Buffer.length) {
        var base64Str = base64Buffer[base64Pos]
        base64Pos = base64Pos + 1;
        // console.log("base64Buffer", base64Buffer)
        // console.log("base64Str", base64Str)

        rtcSend(requestID + '=' + base64Str);
      }

      if (end === endPos && (base64Pos === base64Buffer.length)) {
        //all file chunks have been sent
        finish();
      }
      else {
        //go to next chunk
        //setTimeout(readChunk, 0);
        readChunk();
      }
    }

    function finish() {
      //empty buffer
      base64Buffer.length = 0;
      base64Pos = 0;

      //raise pc change event
      uploadUpdateCallback(100);

      //raise finish event
      uploadFinishedCallback();

      //send empty file chunk signifying end of file
      rtcSend(requestID + '=');

      rtcSend(JSON.stringify({ type: "end" }));

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

  return {
    sendFile: sendFile,
    cancelUpload: cancelUpload
  };
}