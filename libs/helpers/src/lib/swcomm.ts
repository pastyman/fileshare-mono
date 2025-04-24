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
      //register sw if not already there
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        console.log(registrations);

        if (registrations.length === 0) {
          //service worker not already there - register
          navigator.serviceWorker.register('/sw.js')
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

    //listen to messages
    broadcastFromSw.onmessage = (event: MessageEvent<any>) => {
      swDataAccept = true;

      const { header, chunk } =  decodeChunkWithHeader(event.data);

      //let msg = JSON.parse(event.data);
      if (header.type === "file-send") {
        console.log('rtc command msg from sw!', header);

        //file request from service worker, forward to host via rtc
        rtcObj.send(encodeChunkWithHeader(header));
      }
      if (header.type === "progress") {
        downloadUpdateCallback(header.percent);
      }
      if (header.type === "cancel") {
        console.log('rtc command msg from sw!', header);

        //file request from service worker, forward to host via rtc
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