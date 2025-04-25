//@ts-ignore
import hashtable from "alib-hashtable";
import { encodeChunkWithHeader } from "rtc-client";

const CHUNK_SIZE = 12_000;
const BUFFER_MAX = 4384;
const MAX_QUEUE = 32;

export const filesender = () => {
  const requests = hashtable("requestID");

  function sendFile(
    file: File,
    requestID: number,
    range: { startPos: number; endPos: number },
    rtcSend: any,
    rtcBufferedAmount: any,
    uploadUpdateCallback: any,
    uploadFinishedCallback: any
  ) {
    requests.set({ requestID, cancel: false });

    console.log("SEND FILE");
    console.log("requestID", requestID);
    console.log("range", range);

    let queue: ArrayBuffer[] = [];
    let done = false;
    let totalSent = 0;
    let percentSent = -1;

    const isCancelled = () => requests.get(requestID).cancel;

    uploadUpdateCallback(0);

    const worker = createInlinePullWorker();

    worker.onmessage = (e) => {
      const { type, chunk, requestID: msgID } = e.data;
      if (type === "chunk") {
        queue.push(chunk);
      } else if (type === "done") {
        done = true;
      }
    };

    worker.postMessage({
      file,
      start: range.startPos,
      end: range.endPos,
      chunkSize: CHUNK_SIZE,
      requestID,
    });

    function sendLoop() {
      if (isCancelled()) {
        worker.terminate();
        console.log("Upload cancelled.");
        return;
      }

      while (queue.length > 0 && rtcBufferedAmount() < BUFFER_MAX) {
        const chunk = queue.shift()!;
        totalSent += chunk.byteLength;

        rtcSend(
          encodeChunkWithHeader(
            {
              type: "file-send",
              data: { requestID },
            },
            chunk
          )
        );

        const percent = Math.floor((totalSent / (range.endPos - range.startPos)) * 100);
        if (percent !== percentSent && percent < 100) {
          percentSent = percent;
          uploadUpdateCallback(percent);
        }
      }

      if (done && queue.length === 0) {
        rtcSend(
          encodeChunkWithHeader({
            type: "file-end",
            data: { requestID },
          })
        );
        uploadUpdateCallback(100);
        uploadFinishedCallback();
        worker.terminate();
        console.log("EXIT!");
        return;
      }

      setTimeout(sendLoop, 0);
    }

    sendLoop();
  }

  function cancelUpload(requestID: number) {
    console.log("cancelUpload ! request sent");
    requests.set({ requestID, cancel: true });
  }

  function cancelAll() {
    const all = requests.getCollection();
    all.forEach((item: any) => {
      requests.set({ requestID: item.requestID, cancel: true });
    });
  }

  return {
    sendFile,
    cancelUpload,
    cancelAll,
  };
};

function createInlinePullWorker(): Worker {
  const workerCode = `
    self.onmessage = async (e) => {
      const { file, start, end, chunkSize, requestID } = e.data;
      let offset = start;

      while (offset < end) {
        const sliceEnd = Math.min(offset + chunkSize, end);
        const chunk = await file.slice(offset, sliceEnd).arrayBuffer();
        self.postMessage({ type: 'chunk', chunk, requestID }, [chunk]);
        offset = sliceEnd;
      }

      self.postMessage({ type: 'done', requestID });
    };
  `;
  const blob = new Blob([workerCode], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}
