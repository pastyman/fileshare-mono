// @ts-ignore
import hashtable from "alib-hashtable";
import { encodeChunkWithHeader } from "rtc-client";

export const filesender = () => {
  const BINARY_CHUNK = 12000;
  const BUFFER_MAX = 16384; // Max safe rtcBufferedAmount

  const requests = hashtable("requestID");

  function sendFile(
    file: File,
    requestID: number,
    range: { startPos: number; endPos: number },
    rtcSend: (data: ArrayBuffer) => void,
    rtcBufferedAmount: () => number,
    uploadUpdateCallback: (progress: number) => void,
    uploadFinishedCallback: () => void
  ) {
    requests.set({ requestID, cancel: false });

    let offset = range.startPos;
    const endPos = range.endPos;
    const totalLength = endPos - range.startPos;
    let sentBytes = 0;

    const isCancelled = () => requests.get(requestID)?.cancel;

    const stream = new ReadableStream({
      async pull(controller) {
        if (isCancelled()) {
          controller.close();
          return;
        }

        if (offset >= endPos) {
          uploadUpdateCallback(100);
          rtcSend(
            encodeChunkWithHeader({ type: "file-end", data: { requestID } }, new ArrayBuffer(0))
          );
          uploadFinishedCallback();
          controller.close();
          return;
        }

        if (rtcBufferedAmount() >= BUFFER_MAX) {
          setTimeout(() => controller.enqueue(null), 10);
          return;
        }

        const nextEnd = Math.min(offset + BINARY_CHUNK, endPos);
        const chunk = await file.slice(offset, nextEnd).arrayBuffer();

        sentBytes += chunk.byteLength;
        offset = nextEnd;

        const progress = Math.floor((sentBytes / totalLength) * 100);
        uploadUpdateCallback(Math.min(progress, 99));

        rtcSend(
          encodeChunkWithHeader(
            { type: "file-send", data: { requestID } },
            chunk
          )
        );

        // Continue next chunk in next tick
        setTimeout(() => {
          try {
            controller.enqueue(null)
          }
          catch (e) {
            console.error("Error in enqueueing null", e)
          }
        }, 0);
      }
    });

    // Start reading stream
    const reader = stream.getReader();
    const loop = () => reader.read().then(({ done }) => {
      if (!done) setTimeout(loop, 0);
    });
    loop();
  }

  function cancelUpload(requestID: number) {
    console.log("cancelUpload: request sent");
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
