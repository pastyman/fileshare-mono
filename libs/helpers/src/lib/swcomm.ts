import {encodeChunkWithHeader, decodeChunkWithHeader} from "rtc-client";

export const swcomm = (downloadUpdateCallback: any, rtcObj: any) => {
  "use strict";

  let swDataAccept = false;
  let broadcastToSw: any = null;
  let broadcastFromSw: any = null;
  const pausedRequests = new Set<number>();

  function init() {
    broadcastToSw = new BroadcastChannel('channel-sfsw-tosw');
    broadcastFromSw = new BroadcastChannel('channel-sfsw-fromsw');

    try {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        console.log(registrations);

        if (registrations.length === 0) {
          navigator.serviceWorker.register('/swv24052025r1.js')
            .then(function (reg) {
              console.log('SERVICE WORKER READY!!!');
            })
            .catch(function (err) {
              console.log('Boo!', err);
            });
        }
      });
    }
    catch (exc) {
      console.log(exc);
    }

    broadcastFromSw.onmessage = (event: MessageEvent<any>) => {
      swDataAccept = true;

      const { header } =  decodeChunkWithHeader(event.data);

      if (header.type === "file-send") {
        console.log('rtc command msg from sw!', header);
        rtcObj.send(encodeChunkWithHeader(header));
      }
      if (header.type === "progress") {
        downloadUpdateCallback(header.data.percent);
      }
      if (header.type === "cancel") {
        console.log('rtc command msg from sw!', header);
        rtcObj.send(encodeChunkWithHeader(header));
      }
      if (header.type === "pause") {
        pausedRequests.add(header.data.requestID);
        rtcObj.send(encodeChunkWithHeader(header));
      }
      if (header.type === "resume") {
        pausedRequests.delete(header.data.requestID);
        rtcObj.send(encodeChunkWithHeader(header));
      }
    };
  }

  function close() {
    broadcastToSw && broadcastToSw.close();
    broadcastFromSw && broadcastFromSw.close();
    pausedRequests.clear();

    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  function saveChunk(binaryChunk: any) {
    try {
      const { header } = decodeChunkWithHeader(binaryChunk);

      if (
        header.type === "file-send" &&
        pausedRequests.has(header.data.requestID)
      ) {
        return;
      }

      broadcastToSw.postMessage(binaryChunk);
    }
    catch (exc) {
      console.log(exc);
    }
  }

  return {
    init,
    close,
    saveChunk,
  };
}
