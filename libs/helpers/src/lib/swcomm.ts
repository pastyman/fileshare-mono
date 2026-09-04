import {encodeChunkWithHeader, decodeChunkWithHeader} from "rtc-client";

export const swcomm = (downloadUpdateCallback: any, rtcObj: any) => {
  "use strict";

  let swDataAccept = false;
  let broadcastToSw: any = null;
  let broadcastFromSw: any = null;

  function init() {
    broadcastToSw = new BroadcastChannel('channel-sfsw-tosw');
    broadcastFromSw = new BroadcastChannel('channel-sfsw-fromsw');

    try {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        console.log(registrations);

        for (let registration of registrations) {
          registration.unregister();
        }

        navigator.serviceWorker.register('/swv04092026r6.js')
          .then(function (reg) {
            console.log('SERVICE WORKER READY!!!');
          })
          .catch(function (err) {
            console.log('Boo!', err);
          });
      });
    }
    catch (exc) {
      console.log(exc);
    }

    broadcastFromSw.onmessage = (event: MessageEvent<any>) => {
      swDataAccept = true;

      const { header } =  decodeChunkWithHeader(event.data);

      if (header.type === "file-send") {
        rtcObj.send(encodeChunkWithHeader(header));
      }
      if (header.type === "progress") {
        downloadUpdateCallback(header.data.percent);
      }
      if (header.type === "cancel") {
        console.log("[filebump sw] cancel", header.data);
        rtcObj.send(encodeChunkWithHeader(header));
      }
      if (header.type === "pause") {
        rtcObj.send(encodeChunkWithHeader(header));
      }
      if (header.type === "resume") {
        rtcObj.send(encodeChunkWithHeader(header));
      }
    };
  }

  function close() {
    broadcastToSw && broadcastToSw.close();
    broadcastFromSw && broadcastFromSw.close();

    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  function saveChunk(binaryChunk: any) {
    try {
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
