//strict mode
"use strict";

//glob
var mimes = [
  // Web core
  { mime: 'text/html', ext: '.html' },
  { mime: 'text/css', ext: '.css' },
  { mime: 'application/javascript', ext: '.js' },
  { mime: 'application/json', ext: '.json' },
  { mime: 'application/xml', ext: '.xml' },

  // Images
  { mime: 'image/jpeg', ext: '.jpg' },
  { mime: 'image/png', ext: '.png' },
  { mime: 'image/gif', ext: '.gif' },
  { mime: 'image/webp', ext: '.webp' },
  { mime: 'image/svg+xml', ext: '.svg' },

  // Audio/Video
  { mime: 'audio/mpeg', ext: '.mp3' },
  { mime: 'audio/ogg', ext: '.ogg' },
  { mime: 'audio/wav', ext: '.wav' },
  { mime: 'video/mp4', ext: '.mp4' },
  { mime: 'video/webm', ext: '.webm' },
  { mime: 'video/ogg', ext: '.ogv' },

  // Fonts
  { mime: 'font/woff', ext: '.woff' },
  { mime: 'font/woff2', ext: '.woff2' },
  { mime: 'application/font-woff', ext: '.woff' },

  // Documents & Productivity
  { mime: 'application/pdf', ext: '.pdf' },
  { mime: 'application/msword', ext: '.doc' },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: '.docx' },
  { mime: 'application/vnd.ms-excel', ext: '.xls' },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: '.xlsx' },
  { mime: 'application/vnd.ms-powerpoint', ext: '.ppt' },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: '.pptx' },
  { mime: 'text/plain', ext: '.txt' },
  { mime: 'application/rtf', ext: '.rtf' },

  // Archives & Downloads
  { mime: 'application/zip', ext: '.zip' },
  { mime: 'application/x-rar-compressed', ext: '.rar' },
  { mime: 'application/x-7z-compressed', ext: '.7z' },
  { mime: 'application/x-tar', ext: '.tar' },
  { mime: 'application/octet-stream', ext: '.bin' },

];

//stop console log
console.log = function (message) { };

const arrRequests = [];
//const RANGE_SIZE = 1048576; //1 MB
const RANGE_SIZE = 8388608; //8 MB
//const RANGE_SIZE = 67108864; //64 MB
const TIMEOUT = 30000 //30 secs
const broadcastToSw = new BroadcastChannel('channel-sfsw-tosw');
const broadcastFromSw = new BroadcastChannel('channel-sfsw-fromsw');

const decodeChunkWithHeader = (binaryChunk) => {
  const view = new DataView(binaryChunk);
  const headerLength = view.getUint32(0); // Read first 4 bytes

  const headerBytes = new Uint8Array(binaryChunk, 4, headerLength);
  const headerText = new TextDecoder().decode(headerBytes);
  const header = JSON.parse(headerText);

  const chunkStart = 4 + headerLength;
  const chunk = new Uint8Array(binaryChunk, chunkStart);

  return { header, chunk };
}

const encodeChunkWithHeader = (header, binaryChunk) => {
  const jsonHeader = header;
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(jsonHeader);
  const headerLength = headerBytes.length;

  const chunk = binaryChunk ?? new ArrayBuffer(0); // Default to empty buffer if undefined

  const buffer = new ArrayBuffer(4 + headerLength + chunk.byteLength);
  const view = new DataView(buffer);

  view.setUint32(0, headerLength); // First 4 bytes = header size
  new Uint8Array(buffer, 4, headerLength).set(headerBytes);
  new Uint8Array(buffer, 4 + headerLength).set(new Uint8Array(chunk));

  return buffer;
};

//listen to messages
broadcastToSw.onmessage = (event) => {
//console.log("SW RECIEVED MESSAGE", event.data);

  const { header, chunk } =  decodeChunkWithHeader(event.data);

  if (header.type === "file-end") {
      var strRequestID = header.data.requestID;
      console.log('sw recieved data RequestID', strRequestID)
      try {
        arrRequests[parseInt(strRequestID)].push(new ArrayBuffer(0));
      }
      catch (exc) {
        console.log('buffer write error', exc);
      }
    }

  if (header.type === "file-send") {
    //get request id and data
    var strRequestID = header.data.requestID;
    console.log('sw recieved data RequestID', strRequestID)
    try {
      arrRequests[parseInt(strRequestID)].push(chunk);
    }
    catch (exc) {
      console.log('buffer write error', exc);

      sendMessageToClient({
        type: "cancel",
        data: {
          requestID: parseInt(strRequestID),
        }
      });
    }
  }
};

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
  console.log('V1 installing...');
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());

  console.log('activate V1 now ready to handle fetches!');
});

self.addEventListener('fetch', function (event) {
  //get url
  const url = event.request.url;
  //extract from url
  const base = getFolder(url, 1);

  console.log('url SW', url)
  console.log('base', base)

  //just serve requests from download folder
  if (base === 'sfdownload') {
    console.log('Handling fetch event for', url);

    var isFinished = false;
    var isError = false;
    var lastDataRecievedTime = Date.now();
    const requestID = arrRequests.length;
    arrRequests[requestID] = [];
    console.log('Handling fetch event for', url, base, requestID);

    //file name example
    // /sfdownload/${index}/${file.size}/${file.name}

    //extract info from file name
    var urlEndIndex = url.split('/').length - 1
    var urlArray = url.split('/')
    var fileName = decodeURIComponent(urlArray[urlEndIndex]);
    var fileSize = parseInt(urlArray[urlEndIndex - 1]);
    var fileIndex = parseInt(urlArray[urlEndIndex - 2]);

    //set defaults
    var isRangeRequest = false;
    var startPos = 0;
    var endPos = fileSize - 1;
    if (event.request.headers.get('range')) {
      //range request made
      isRangeRequest = true;
      const rangeHeader = event.request.headers.get('range');

      console.log('RANGE REQUEST MADE!')
      console.log(rangeHeader);

      //start pos - bytes=0-
      startPos = parseInt(rangeHeader.split('bytes=')[1].split('-')[0]);
      endPos = parseInt(rangeHeader.split('bytes=')[1].split('-')[1]);
      endPos = Number.isNaN(endPos) ? null : endPos;
      if (!endPos) {
        //end position not specified as range unknowen, return a sensible range end
        endPos = (startPos + RANGE_SIZE) < fileSize ? startPos + RANGE_SIZE : fileSize - 1;
        //endPos = fileSize - 1;
      }
    }
    var percentage = 0;
    var percentSent = -1;
    var pos = startPos;

    //temp log
    console.log({
      type: "file-send",
      data: {
        requestID,
        range: {
          startPos,
          endPos: endPos + 1
        },
        fileinfo: {
          name: fileName,
          size: fileSize,
          index: fileIndex,
        }
      }
    })

    //send request for file
    sendMessageToClient({
      type: "file-send",
      data: {
        requestID,
        range: {
          startPos,
          endPos: endPos + 1
        },
        fileinfo: {
          name: fileName,
          size: fileSize,
          index: fileIndex,
        }
      }
    });

    sendMessageToClient({ type: "progress", data: { percent: 0 } });

    var stream = new ReadableStream({
      start(controller) {
        function push() {
          //save chunks
          while (arrRequests[requestID] !== undefined && arrRequests[requestID].length > 0 && isFinished === false && isError === false) {
            var binaryData = arrRequests[requestID].shift();
            var binaryDataLength = binaryData.byteLength;


            //console.log("binaryData.byteLength", binaryData.byteLength)
            if (binaryDataLength > 0) {
              //set position
              pos = pos + binaryDataLength;

              //update data recieved flag
              lastDataRecievedTime = Date.now();

              //calc percent prog and update 
              percentage = (((pos - startPos) / (endPos - startPos)) * 100).toFixed();
              if (percentSent !== percentage) {
                percentSent = percentage;
                sendMessageToClient({ type: "progress", data: { percent: percentSent } });
              }

              //add data to stream
              try {
                controller.enqueue(binaryData);
              }
              catch (exc) {
                //cancel = true;
                console.log('controller.enqueue error', exc);
                isError = true;
              }
            }
            else {
              //empty data sent signiling file end reached
              console.log('finished CALLED');
              isFinished = true;
            }
          }

          //check timeout
          if ((Date.now() - lastDataRecievedTime) > TIMEOUT) {
            isError = true;
          }

          //check finished
          //console.log('finished', isFinished)
          if (isFinished || isError) {
            //end of stream - file successfully downloaded
            try {
              controller.close();
              console.log('sw STREAM CLOSED!');
            }
            catch (exc) {
              //cancel = true;
              console.log('controller.close error', exc)
            }

            if (isError) {
              //send server a cancel message
              sendMessageToClient({
                type: "cancel",
                data: {
                  requestID,
                }
              });

              console.log('sw isError!');
            }

            sendMessageToClient({ type: "progress", data: { percent: 100 } });

            //reset filebuffer
            arrRequests[requestID] = undefined;
          }
          else {
            //console.log('pushing next chunk', pos, endPos);

            //call next chunk
            setTimeout(push, 1);
          }
        }

        //start download off
        push();
      }
    });

    //response
    var init = {
      headers: [
        ['Content-Type', getMime(fileName) + '; charset=utf-8'],
        ['Content-Disposition', 'attachment; filename="' + fileName + '"'],
        ['Content-Length', fileSize]
      ]
    };

    if (isRangeRequest) {
      init = {
        status: 206,
        statusText: 'Partial Content',
        headers: [
          ['Accept-Ranges', 'bytes'],
          ['Content-Length', ((endPos - startPos) + 1)],
          ['Content-Type', getMime(fileName) + '; charset=utf-8'],
          ['Content-Range', 'bytes ' + startPos + '-' + endPos + '/' + fileSize]]
      }
    }

    var response = new Response(stream, init);
    event.respondWith(response);
  }
});

//comms
function sendMessageToClient(msg) {
  broadcastFromSw.postMessage(encodeChunkWithHeader(JSON.stringify(msg)));
}

function getMime(filename) {
  var retVal = 'application/octet-stream';

  var fileExt = filename.split('.').pop();
  if (fileExt !== filename && fileExt.length < 6) {
    //file ext valid, lets search for mime type
    fileExt = '.' + fileExt.toLowerCase();

    for (var i = 0; i < mimes.length; i++) {
      if (mimes[i].ext === fileExt) {
        retVal = mimes[i].mime;
        break;
      }
    }
  }

  console.log(fileExt);
  console.log(retVal);

  return retVal;
}

function getFolder(url, folderPos) {
  const arrFolders = url.replace('://', '').split('/');
  if (arrFolders.length > folderPos) {
    return arrFolders[folderPos];
  }
  return null;
}