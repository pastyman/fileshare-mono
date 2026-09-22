import { getUUID } from 'helpers';
import {
  client,
  serverSendRecieve,
  loadIce,
  decodeChunkWithHeader,
  encodeChunkWithHeader,
} from 'rtc-client';

type DirEntry = {
  name: string;
  type: 'file' | 'dir';
  size?: number;
  relativePath: string;
};

type RTCConnectionInfo = {
  peerId: string;
  folderId: string;
  folderPath: string;
  signalingBaseUrl: string;
  isPasswordProtected?: boolean;
};

const logToDom = (message: string) => {
  console.log(message);
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML += `<p style="margin:4px 0;font-family:monospace;font-size:13px;">${message}</p>`;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const BUFFER_MAX = 1_048_576;
const CHUNK_SIZE = 200_000;

async function sendBytes(
  bytes: Uint8Array,
  requestID: number,
  rtcSend: (message: ArrayBuffer) => void,
  rtcBufferedAmount: () => number | null,
  cancelled: () => boolean
) {
  let pos = 0;
  while (pos < bytes.byteLength) {
    if (cancelled()) return;

    let buffered = rtcBufferedAmount();
    while (buffered !== null && buffered >= BUFFER_MAX) {
      if (cancelled()) return;
      await sleep(15);
      buffered = rtcBufferedAmount();
    }

    const sliceEnd = Math.min(pos + CHUNK_SIZE, bytes.byteLength);
    rtcSend(
      encodeChunkWithHeader(
        {
          type: 'file-send',
          data: { requestID },
        },
        bytes.subarray(pos, sliceEnd)
      )
    );
    pos = sliceEnd;
  }

  rtcSend(
    encodeChunkWithHeader({
      type: 'file-end',
      data: { requestID, bytesSent: bytes.byteLength },
    })
  );
}

async function sendDiskFileRange(
  folderPath: string,
  relativePath: string,
  requestID: number,
  range: { startPos: number; endPos: number },
  rtcSend: (message: ArrayBuffer) => void,
  rtcBufferedAmount: () => number | null,
  cancelled: () => boolean
) {
  let pos = range.startPos;
  const endPos = range.endPos;

  while (pos < endPos) {
    if (cancelled()) {
      return;
    }

    let buffered = rtcBufferedAmount();
    while (buffered !== null && buffered >= BUFFER_MAX) {
      if (cancelled()) return;
      await sleep(15);
      buffered = rtcBufferedAmount();
    }

    const sliceEnd = Math.min(pos + CHUNK_SIZE, endPos);
    const buffer = await window.electronAPI!.readFileRange(
      folderPath,
      relativePath,
      pos,
      sliceEnd
    );
    const bytes = new Uint8Array(buffer);
    rtcSend(
      encodeChunkWithHeader(
        {
          type: 'file-send',
          data: { requestID },
        },
        bytes
      )
    );
    pos = sliceEnd;
  }

  rtcSend(
    encodeChunkWithHeader({
      type: 'file-end',
      data: { requestID, bytesSent: endPos - range.startPos },
    })
  );
}

async function sendImageThumbnailOrOriginal(
  folderPath: string,
  relativePath: string,
  requestID: number,
  fileSize: number,
  maxWidth: number,
  rtcSend: (message: ArrayBuffer) => void,
  rtcBufferedAmount: () => number | null,
  cancelled: () => boolean
): Promise<number> {
  const thumb = await window.electronAPI!.getImageThumbnail(
    folderPath,
    relativePath,
    maxWidth
  );

  if (thumb && thumb.byteLength > 0) {
    logToDom(
      `Sending JPEG preview for ${relativePath} (max ${maxWidth}px, ${thumb.byteLength} bytes)`
    );
    await sendBytes(
      new Uint8Array(thumb),
      requestID,
      rtcSend,
      rtcBufferedAmount,
      cancelled
    );
    return thumb.byteLength;
  }

  logToDom(`Thumbnail unavailable for ${relativePath}; sending original`);
  await sendDiskFileRange(
    folderPath,
    relativePath,
    requestID,
    { startPos: 0, endPos: fileSize },
    rtcSend,
    rtcBufferedAmount,
    cancelled
  );
  return fileSize;
}

async function registerHost(
  signalingBaseUrl: string,
  peerId: string,
  hostId: string,
  folderId: string
) {
  const response = await fetch(`${signalingBaseUrl}/host`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peerId, hostId, folderId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to register host (${response.status})`);
  }
}

function sendDirListing(
  rtcClient: any,
  payload: {
    path: string;
    entries: DirEntry[];
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
    append: boolean;
  }
) {
  rtcClient.send(
    encodeChunkWithHeader({
      type: 'dirListing',
      data: payload,
    })
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML =
      '<div style="padding:16px;font-family:sans-serif;"><h2>ShareFolder RTC Host</h2><p>Waiting for connection...</p></div>';
  }

  if (!window.electronAPI?.onRTCConnectionInfo) {
    logToDom('Electron API not available');
    return;
  }

  window.electronAPI.onRTCConnectionInfo(async (info: RTCConnectionInfo) => {
    try {
      const {
        peerId,
        folderId,
        folderPath,
        signalingBaseUrl,
        isPasswordProtected = false,
      } = info;
      logToDom(`Peer ${peerId} requested folder ${folderId}`);
      logToDom(`Path: ${folderPath}`);
      logToDom(`Signaling: ${signalingBaseUrl}`);
      if (isPasswordProtected) {
        logToDom('Folder is password-protected — auth required before browse');
      }

      if (!folderPath || folderPath === 'Path not available') {
        logToDom('ERROR: folder path missing');
        window.electronAPI?.closeRtcWindow();
        return;
      }

      const hostId = getUUID();
      await registerHost(signalingBaseUrl, peerId, hostId, folderId);
      logToDom(`Registered host ${hostId}`);

      const iceConfig = await loadIce(signalingBaseUrl);
      if (!iceConfig) {
        logToDom('ERROR: failed to load ICE config');
        window.electronAPI?.closeRtcWindow();
        return;
      }

      let rtcClient: any = null;
      const cancelledRequests = new Set<number>();
      let currentFiles: DirEntry[] = [];
      const PAGE_SIZE = 100;
      let authenticated = !isPasswordProtected;

      const sendAuthRequired = () => {
        rtcClient.send(
          encodeChunkWithHeader({
            type: 'authRequired',
            data: {},
          })
        );
      };

      const sendAuthResult = (
        ok: boolean,
        message?: string,
        user?: { email: string; fullName: string }
      ) => {
        rtcClient.send(
          encodeChunkWithHeader({
            type: ok ? 'authOk' : 'authFail',
            data: ok
              ? { email: user?.email, fullName: user?.fullName }
              : { message: message || 'Invalid email or password' },
          })
        );
      };

      const loadAndSendDir = async (relativePath: string, offset = 0) => {
        if (!authenticated) {
          sendAuthRequired();
          return;
        }
        const page = await window.electronAPI!.listDir(
          folderPath,
          relativePath,
          offset,
          PAGE_SIZE
        );
        const pageFiles = page.entries.filter((e) => e.type === 'file');
        if (offset === 0) {
          currentFiles = pageFiles;
        } else {
          currentFiles = [...currentFiles, ...pageFiles];
        }
        sendDirListing(rtcClient, {
          path: relativePath,
          entries: page.entries,
          offset: page.offset,
          limit: page.limit,
          total: page.total,
          hasMore: page.hasMore,
          append: offset > 0,
        });
        logToDom(
          `Listed ${page.entries.length}/${page.total} in "${relativePath || '/'}" (offset ${page.offset})`
        );
      };

      const onTimeout = () => {
        logToDom('ERROR: signaling timeout');
        window.electronAPI?.closeRtcWindow();
      };

      const handshakeServer = serverSendRecieve(
        hostId,
        peerId,
        (from, to, data, rtcid) =>
          rtcClient.handshakeMsgRecieve(from, to, data, rtcid),
        onTimeout,
        signalingBaseUrl
      );

      const onConnectionSuccess = async () => {
        handshakeServer.close();
        if (!authenticated) {
          logToDom('RTC connected — requesting login');
          sendAuthRequired();
          return;
        }
        logToDom('RTC connected — waiting briefly, then sending root listing');
        // Give the browser a moment to request listDir after connection-success.
        await sleep(250);
        try {
          await loadAndSendDir('');
        } catch (err) {
          logToDom(
            `ERROR sending root listing: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      };

      const onMessageRecieved = async (data: any) => {
        const { header } = decodeChunkWithHeader(data);

        if (header.type === 'auth') {
          const email = String(header.data?.email || '');
          const password = String(header.data?.password || '');
          try {
            const user = await window.electronAPI!.dbAuthenticateUser(
              email,
              password
            );
            if (!user) {
              logToDom(`Auth failed for ${email || '(empty)'}`);
              sendAuthResult(false);
              return;
            }
            authenticated = true;
            logToDom(`Auth ok: ${user.email}`);
            sendAuthResult(true, undefined, {
              email: user.email,
              fullName: user.fullName,
            });
          } catch (err) {
            logToDom(
              `Auth error: ${err instanceof Error ? err.message : String(err)}`
            );
            sendAuthResult(false, 'Authentication failed');
          }
          return;
        }

        if (!authenticated) {
          if (
            header.type === 'listDir' ||
            header.type === 'file-send' ||
            header.type === 'cancel'
          ) {
            sendAuthRequired();
          }
          return;
        }

        if (header.type === 'listDir') {
          const reqPath = (header.data?.path as string) || '';
          const offset = Number(header.data?.offset) || 0;
          try {
            await loadAndSendDir(reqPath, offset);
          } catch (err) {
            logToDom(
              `ERROR listing ${reqPath}: ${
                err instanceof Error ? err.message : String(err)
              }`
            );
          }
        }

        if (header.type === 'file-send') {
          const requestID = header.data.requestID as number;
          const fileIndex = header.data.fileinfo.index as number;
          const fileSize = Number(header.data.fileinfo.size) || 0;
          const thumbWidth = Number(header.data.thumbnail) || 0;
          const range = header.data.range as {
            startPos: number;
            endPos: number;
          };
          // Prefer explicit path from client; fall back to current listing index
          const relativePath =
            (header.data.fileinfo.path as string) ||
            (header.data.fileinfo.name as string) ||
            currentFiles[fileIndex]?.relativePath;

          if (!relativePath) {
            logToDom(`Unknown file index ${fileIndex}`);
            return;
          }

          cancelledRequests.delete(requestID);

          if (thumbWidth > 0) {
            const previewBytes = await sendImageThumbnailOrOriginal(
              folderPath,
              relativePath,
              requestID,
              fileSize || currentFiles[fileIndex]?.size || 0,
              thumbWidth,
              rtcClient.send,
              rtcClient.bufferedAmount,
              () => cancelledRequests.has(requestID)
            );
            if (
              previewBytes > 0 &&
              !cancelledRequests.has(requestID) &&
              window.electronAPI?.recordPreviewEvent
            ) {
              try {
                await window.electronAPI.recordPreviewEvent(
                  folderId,
                  relativePath,
                  previewBytes
                );
              } catch (err) {
                logToDom(
                  `Failed to record preview stats: ${
                    err instanceof Error ? err.message : String(err)
                  }`
                );
              }
            }
            return;
          }

          const fullSize = fileSize || currentFiles[fileIndex]?.size || 0;
          const isFullFile =
            range.startPos === 0 &&
            fullSize > 0 &&
            range.endPos >= fullSize;

          logToDom(
            `Sending ${relativePath} bytes ${range.startPos}-${range.endPos}`
          );
          await sendDiskFileRange(
            folderPath,
            relativePath,
            requestID,
            range,
            rtcClient.send,
            rtcClient.bufferedAmount,
            () => cancelledRequests.has(requestID)
          );

          if (
            isFullFile &&
            !cancelledRequests.has(requestID) &&
            window.electronAPI?.recordDownloadEvent
          ) {
            try {
              await window.electronAPI.recordDownloadEvent(
                folderId,
                relativePath,
                fullSize
              );
            } catch (err) {
              logToDom(
                `Failed to record download stats: ${
                  err instanceof Error ? err.message : String(err)
                }`
              );
            }
          }
        }

        if (header.type === 'cancel') {
          cancelledRequests.add(header.data.requestID);
          logToDom(`Cancel request ${header.data.requestID}`);
        }
      };

      let windowClosing = false;
      const closeHostWindow = () => {
        if (windowClosing) return;
        windowClosing = true;
        try {
          handshakeServer.close();
        } catch {
          // already closed
        }
        window.electronAPI?.closeRtcWindow();
      };

      const onConnectionClosed = () => {
        logToDom('RTC disconnected — closing host window');
        closeHostWindow();
      };

      rtcClient = client(
        iceConfig,
        onMessageRecieved,
        onConnectionSuccess,
        onConnectionClosed,
        handshakeServer.send
      );
      rtcClient.connect(hostId, peerId, false);
      logToDom('Starting WebRTC handshake...');
    } catch (error) {
      console.error(error);
      logToDom(
        `ERROR: ${error instanceof Error ? error.message : String(error)}`
      );
      window.electronAPI?.closeRtcWindow();
    }
  });
});
