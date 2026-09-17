'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { generateGuid } from '@/lib/utils';
import {
  client,
  serverSendRecieve,
  loadIce,
  decodeChunkWithHeader,
  encodeChunkWithHeader,
} from 'rtc-client';
import {
  swcomm,
  DownloadProgressEvent,
  formatFileSize,
  isImage,
  isVideo,
} from 'helpers';

type DirEntry = {
  name: string;
  type: 'file' | 'dir';
  size?: number;
  relativePath: string;
};

type Status =
  | 'signaling'
  | 'waiting-host'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected';

const SIGNALING_BASE =
  process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3001';

const statusCopy: Record<Status, string> = {
  signaling: 'Contacting desktop app…',
  'waiting-host': 'Waiting for desktop app…',
  connecting: 'Establishing peer connection…',
  connected: 'Connected',
  disconnected: 'Disconnected',
  error: 'Connection failed',
};

async function waitForHost(peerId: string, timeoutMs = 120_000): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await fetch(
      `${SIGNALING_BASE}/host?peerId=${encodeURIComponent(peerId)}`
    );
    if (res.status === 200) {
      const data = await res.json();
      if (data.hostId) return data.hostId as string;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Timed out waiting for ShareFolder desktop app');
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M14 3.5V9h5.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function FileRow({
  file,
  fileIndex,
  progress,
  onDownloadStart,
}: {
  file: DirEntry;
  fileIndex: number;
  progress?: { percent: number; done: boolean } | null;
  onDownloadStart: (fileIndex: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [download, setDownload] = useState(false);
  const size = file.size ?? 0;
  const downloadName = encodeURIComponent(file.relativePath);

  return (
    <div className="sf-panel overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-white/50"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mt-0.5 text-[var(--sf-ink-muted)]">
          <FileIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block break-all font-medium text-[var(--sf-ink)]">
            {file.name}
          </span>
          <span className="mt-1 block text-sm text-[var(--sf-ink-muted)]">
            {formatFileSize(String(size))}
          </span>
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-[var(--sf-line)] px-4 py-4 pl-11">
          {isImage(file.name) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/sfdownload/${fileIndex}/${size}/${downloadName}`}
              alt={file.name}
              className="max-h-80 max-w-full rounded-sm object-contain"
            />
          )}
          {isVideo(file.name) && (
            <video className="aspect-video w-full bg-[var(--sf-ink)]" controls>
              <source src={`/sfdownload/${fileIndex}/${size}/${downloadName}`} />
            </video>
          )}

          <button
            type="button"
            className="bg-[var(--sf-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--sf-accent)]"
            onClick={() => {
              onDownloadStart(fileIndex);
              setDownload(false);
              setTimeout(() => setDownload(true), 150);
            }}
          >
            Download
          </button>

          {progress && (
            <div>
              <div className="mb-2 flex justify-between text-sm text-[var(--sf-ink-muted)]">
                <span>{progress.done ? 'Downloaded' : 'Downloading'}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden bg-[var(--sf-bg-deep)]">
                <div
                  className="h-full bg-[var(--sf-accent)] transition-all duration-150"
                  style={{ width: `${Math.min(100, progress.percent)}%` }}
                />
              </div>
            </div>
          )}

          {download && (
            <iframe
              title={`download-${fileIndex}`}
              src={`/sfdownload/${fileIndex}/${size}/${downloadName}`}
              className="hidden"
              width={0}
              height={0}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function FolderPage() {
  const params = useParams();
  const [status, setStatus] = useState<Status>('signaling');
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [listingLoading, setListingLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [peerId] = useState(() => generateGuid());
  const [downloadProgress, setDownloadProgress] = useState<
    Record<number, { percent: number; done: boolean }>
  >({});
  const trackedDownloadsRef = useRef<Set<number>>(new Set());
  const startedRef = useRef(false);
  const rtcClientRef = useRef<any>(null);
  const entriesLenRef = useRef(0);

  useEffect(() => {
    entriesLenRef.current = entries.length;
  }, [entries]);

  const requestDir = useCallback((path: string, offset = 0) => {
    const rtc = rtcClientRef.current;
    if (!rtc) return;
    if (offset > 0) {
      setLoadingMore(true);
    } else {
      setListingLoading(true);
      setDownloadProgress({});
      trackedDownloadsRef.current.clear();
    }
    rtc.send(
      encodeChunkWithHeader({
        type: 'listDir',
        data: { path, offset },
      })
    );
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    const instanceId = Array.isArray(params.instanceId)
      ? params.instanceId[0]
      : params.instanceId;
    const folderId = Array.isArray(params.folderId)
      ? params.folderId[0]
      : params.folderId;

    if (!instanceId || !folderId) return;
    startedRef.current = true;

    let rtcClient: any = null;
    let serviceWorkerComm: any = null;
    let handshakeServer: any = null;
    let cancelled = false;

    const run = async () => {
      try {
        setStatus('signaling');
        const connectRes = await fetch('/api/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceId, folderId, peerId }),
        });
        if (!connectRes.ok) {
          throw new Error(
            `Failed to signal desktop app (${connectRes.status})`
          );
        }

        setStatus('waiting-host');
        const hostId = await waitForHost(peerId);
        if (cancelled) return;

        setStatus('connecting');
        const iceConfig = await loadIce(SIGNALING_BASE);
        if (!iceConfig) {
          throw new Error('Failed to load ICE servers');
        }

        handshakeServer = serverSendRecieve(
          peerId,
          hostId,
          (from, to, data, rtcid) =>
            rtcClient.handshakeMsgRecieve(from, to, data, rtcid),
          () => {
            if (!cancelled) {
              setStatus('error');
              setError('Connection timed out');
            }
          },
          SIGNALING_BASE
        );

        const onDownloadProgress = (progress: DownloadProgressEvent) => {
          if (progress.isRange) return;
          if (!trackedDownloadsRef.current.has(progress.fileIndex)) return;
          setDownloadProgress((prev) => ({
            ...prev,
            [progress.fileIndex]: {
              percent: progress.percent,
              done: progress.percent >= 100,
            },
          }));
        };

        const onConnectionSuccess = () => {
          handshakeServer?.close();
          setStatus('connected');
          setListingLoading(true);
          serviceWorkerComm = swcomm(onDownloadProgress, rtcClient);
          serviceWorkerComm.init();
        };

        const onMessageRecieved = (data: any) => {
          const { header } = decodeChunkWithHeader(data);
          if (header.type === 'dirListing') {
            const payload = header.data as {
              path: string;
              entries: DirEntry[];
              offset?: number;
              total?: number;
              hasMore?: boolean;
              append?: boolean;
            };
            setCurrentPath(payload.path || '');
            setHasMore(Boolean(payload.hasMore));
            setTotalEntries(Number(payload.total) || payload.entries?.length || 0);
            setEntries((prev) =>
              payload.append
                ? [...prev, ...(payload.entries || [])]
                : payload.entries || []
            );
            setListingLoading(false);
            setLoadingMore(false);
          }
          if (header.type === 'fileInfo') {
            const payload = header.data;
            const files = Array.isArray(payload)
              ? payload
              : payload?.files || [];
            setEntries(
              files.map(
                (f: { name: string; size: number }): DirEntry => ({
                  name: f.name.split('/').pop() || f.name,
                  type: 'file',
                  size: f.size,
                  relativePath: f.name,
                })
              )
            );
            setListingLoading(false);
          }
          if (header.type === 'file-send' || header.type === 'file-end') {
            serviceWorkerComm?.saveChunk(data);
          }
        };

        const onConnectionClosed = () => {
          if (!cancelled) setStatus('disconnected');
        };

        rtcClient = client(
          iceConfig,
          onMessageRecieved,
          onConnectionSuccess,
          onConnectionClosed,
          handshakeServer.send
        );
        rtcClientRef.current = rtcClient;
        rtcClient.connect(peerId, hostId, true);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Connection failed');
      }
    };

    run();

    return () => {
      cancelled = true;
      handshakeServer?.close?.();
      serviceWorkerComm?.close?.();
      rtcClient?.close?.();
      rtcClientRef.current = null;
    };
  }, [params, peerId]);

  const breadcrumbs = [
    { label: 'Root', path: '' },
    ...currentPath
      .split('/')
      .filter(Boolean)
      .map((segment, i, parts) => ({
        label: segment,
        path: parts.slice(0, i + 1).join('/'),
      })),
  ];

  const directories = entries.filter((e) => e.type === 'dir');
  const files = entries.filter((e) => e.type === 'file');

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-20">
      <header className="sf-rise mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sf-accent)]">
          Shared folder
        </p>
        <h1 className="sf-display mt-3 text-4xl text-[var(--sf-ink)] sm:text-5xl">
          Browse files
        </h1>
        <p className="mt-3 text-[var(--sf-ink-muted)]">
          {statusCopy[status]}
          {error ? ` — ${error}` : ''}
        </p>
      </header>

      {status !== 'connected' && status !== 'error' && (
        <div className="sf-panel sf-rise-delay flex items-center gap-4 px-6 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--sf-accent)] border-t-transparent" />
          <p className="text-[var(--sf-ink-muted)]">
            Keep the ShareFolder desktop app running with this folder shared.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="sf-panel border-[rgba(140,40,40,0.25)] px-6 py-8 text-[rgb(120,35,35)]">
          {error || 'Something went wrong connecting to the desktop app.'}
        </div>
      )}

      {status === 'connected' && (
        <div className="sf-rise-delay space-y-5">
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span
                key={crumb.path || 'root'}
                className="flex items-center gap-1"
              >
                {i > 0 && (
                  <span className="text-[var(--sf-ink-muted)]">/</span>
                )}
                <button
                  type="button"
                  className={`rounded-sm px-1.5 py-0.5 transition ${
                    i === breadcrumbs.length - 1
                      ? 'font-semibold text-[var(--sf-ink)]'
                      : 'text-[var(--sf-accent)] hover:bg-[var(--sf-accent-soft)]'
                  }`}
                  onClick={() => {
                    if (i < breadcrumbs.length - 1) {
                      requestDir(crumb.path);
                    }
                  }}
                  disabled={i === breadcrumbs.length - 1 || listingLoading}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </nav>

          {listingLoading ? (
            <div className="sf-panel px-6 py-10 text-center text-[var(--sf-ink-muted)]">
              Loading folder…
            </div>
          ) : entries.length === 0 ? (
            <div className="sf-panel px-6 py-10 text-center text-[var(--sf-ink-muted)]">
              This folder is empty.
            </div>
          ) : (
            <div className="space-y-2">
              {directories.map((dir) => (
                <button
                  key={dir.relativePath}
                  type="button"
                  className="sf-panel flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/70"
                  onClick={() => requestDir(dir.relativePath)}
                >
                  <span className="text-[var(--sf-accent)]">
                    <FolderIcon />
                  </span>
                  <span className="break-all font-medium text-[var(--sf-ink)]">
                    {dir.name}
                  </span>
                </button>
              ))}

              {files.map((file, fileIndex) => (
                <FileRow
                  key={file.relativePath}
                  file={file}
                  fileIndex={fileIndex}
                  progress={downloadProgress[fileIndex]}
                  onDownloadStart={(i) => trackedDownloadsRef.current.add(i)}
                />
              ))}

              {hasMore && (
                <div className="pt-2">
                  <button
                    type="button"
                    className="sf-panel w-full px-4 py-3 text-sm font-semibold text-[var(--sf-accent)] transition hover:bg-white/70 disabled:opacity-60"
                    disabled={loadingMore}
                    onClick={() =>
                      requestDir(currentPath, entriesLenRef.current)
                    }
                  >
                    {loadingMore
                      ? 'Loading more…'
                      : `Load more (${entries.length} of ${totalEntries})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
