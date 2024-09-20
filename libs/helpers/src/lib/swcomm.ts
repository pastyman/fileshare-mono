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

      let msg = JSON.parse(event.data);
      if (msg.type === "send") {
        console.log('rtc command msg from sw!', msg);

        //file request from service worker, forward to host via rtc
        rtcObj.send(JSON.stringify(msg));
      }
      if (msg.type === "progress") {
        downloadUpdateCallback(msg.data.percent);
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

  function saveChunk(base64Chunk: string) {
    broadcastToSw.postMessage(base64Chunk);
  }

  return {
    init,
    close,
    saveChunk,
  };
}