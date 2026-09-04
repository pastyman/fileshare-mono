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
let nextRequestID = 0;
//const RANGE_SIZE = 1048576; //1 MB
const RANGE_SIZE = 8388608; //8 MB
//const RANGE_SIZE = 67108864; //64 MB
const TIMEOUT = 30000 //30 secs
const MAX_BUFFERED_BYTES = 16777216; // 16 MB per active request
const LOW_WATER_BYTES = 4194304; // 4 MB
const requestMeta = {};
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

function createRequestMeta(requestID) {
  requestMeta[requestID] = {
    bufferedBytes: 0,
    pendingIncoming: [],
    senderPaused: false,
    wakePush: null,
  };
}

function getRequestMeta(requestID) {
  return requestMeta[requestID];
}

function clearRequestMeta(requestID) {
  delete requestMeta[requestID];
}

function getQueuedByteLength(chunk) {
  if (chunk instanceof ArrayBuffer) {
    return chunk.byteLength;
  }

  if (chunk && chunk.byteLength !== undefined) {
    return chunk.byteLength;
  }

  return 0;
}

function enqueueIncomingChunk(requestID, chunk) {
  const meta = getRequestMeta(requestID);
  if (!meta || arrRequests[requestID] === undefined) {
    return;
  }

  const chunkBytes = getQueuedByteLength(chunk);

  if (meta.bufferedBytes + chunkBytes <= MAX_BUFFERED_BYTES) {
    arrRequests[requestID].push(chunk);
    meta.bufferedBytes += chunkBytes;
    if (meta.wakePush) {
      meta.wakePush();
    }
    return;
  }

  meta.pendingIncoming.push(chunk);

  if (!meta.senderPaused) {
    meta.senderPaused = true;
    sendMessageToClient({
      type: "pause",
      data: { requestID },
    });
  }
}

function drainPendingIncoming(requestID) {
  const meta = getRequestMeta(requestID);
  if (!meta || arrRequests[requestID] === undefined) {
    return;
  }

  while (meta.pendingIncoming.length > 0) {
    const nextChunk = meta.pendingIncoming[0];
    const chunkBytes = getQueuedByteLength(nextChunk);

    if (meta.bufferedBytes + chunkBytes > MAX_BUFFERED_BYTES) {
      break;
    }

    meta.pendingIncoming.shift();
    arrRequests[requestID].push(nextChunk);
    meta.bufferedBytes += chunkBytes;
  }

  if (
    meta.senderPaused &&
    meta.bufferedBytes <= LOW_WATER_BYTES &&
    meta.pendingIncoming.length === 0
  ) {
    meta.senderPaused = false;
    sendMessageToClient({
      type: "resume",
      data: { requestID },
    });
  }
}

function dequeueChunk(requestID, chunk) {
  const meta = getRequestMeta(requestID);
  if (!meta) {
    return;
  }

  meta.bufferedBytes = Math.max(0, meta.bufferedBytes - getQueuedByteLength(chunk));
  drainPendingIncoming(requestID);
}

//listen to messages
broadcastToSw.onmessage = (event) => {
//console.log("SW RECIEVED MESSAGE", event.data);

  const { header, chunk } =  decodeChunkWithHeader(event.data);
  const requestID = parseInt(header.data.requestID, 10);

  if (header.type === "file-end") {
      console.log('sw recieved data RequestID', requestID)
      try {
        enqueueIncomingChunk(requestID, new ArrayBuffer(0));
      }
      catch (exc) {
        console.log('buffer write error', exc);
      }
    }

  if (header.type === "file-send") {
    console.log('sw recieved data RequestID', requestID)
    try {
      enqueueIncomingChunk(requestID, chunk);
    }
    catch (exc) {
      console.log('buffer write error', exc);

      sendMessageToClient({
        type: "cancel",
        data: {
          requestID,
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
  const url = event.request.url;

  console.log('url SW', url)

  if (!isSfDownloadUrl(url)) {
    return;
  }

  console.log('Handling fetch event for', url);

    var isFinished = false;
    var isError = false;
    var lastDataRecievedTime = Date.now();
    const requestID = nextRequestID++;
    arrRequests[requestID] = [];
    createRequestMeta(requestID);
    console.log('Handling fetch event for', url, requestID);

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
    const rangeSpan = Math.max(endPos - startPos, 1);

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
        const meta = getRequestMeta(requestID);

        function push() {
          while (arrRequests[requestID] !== undefined && arrRequests[requestID].length > 0 && isFinished === false && isError === false) {
            var binaryData = arrRequests[requestID].shift();
            var binaryDataLength = binaryData.byteLength;

            dequeueChunk(requestID, binaryData);

            if (binaryDataLength > 0) {
              pos = pos + binaryDataLength;
              lastDataRecievedTime = Date.now();

              percentage = (((pos - startPos) / rangeSpan) * 100).toFixed();
              if (percentSent !== percentage) {
                percentSent = percentage;
                sendMessageToClient({ type: "progress", data: { percent: percentSent } });
              }

              try {
                controller.enqueue(binaryData);
              }
              catch (exc) {
                console.log('controller.enqueue error', exc);
                isError = true;
              }
            }
            else {
              console.log('finished CALLED');
              isFinished = true;
            }
          }

          if ((Date.now() - lastDataRecievedTime) > TIMEOUT) {
            isError = true;
          }

          if (isFinished || isError) {
            try {
              controller.close();
              console.log('sw STREAM CLOSED!');
            }
            catch (exc) {
              console.log('controller.close error', exc)
            }

            if (isError) {
              sendMessageToClient({
                type: "cancel",
                data: {
                  requestID,
                }
              });

              console.log('sw isError!');
            } else {
              sendMessageToClient({ type: "progress", data: { percent: 100 } });
            }

            arrRequests[requestID] = undefined;
            clearRequestMeta(requestID);
            if (meta) {
              meta.wakePush = null;
            }
          } else if (arrRequests[requestID].length === 0) {
            setTimeout(push, 250);
          }
        }

        if (meta) {
          meta.wakePush = push;
        }

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
});

//comms
function sendMessageToClient(msg) {
  broadcastFromSw.postMessage(encodeChunkWithHeader(JSON.stringify(msg)));
}

function isSfDownloadUrl(url) {
  try {
    return new URL(url).pathname.startsWith('/sfdownload/');
  }
  catch (exc) {
    return false;
  }
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