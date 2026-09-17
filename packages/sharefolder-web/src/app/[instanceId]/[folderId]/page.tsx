'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

function ListViewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="4.5" cy="6" r="1.2" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TileViewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

type ViewMode = 'list' | 'tile';

type MediaPreview = {
  fileIndex: number;
  name: string;
  src: string;
  kind: 'image' | 'video';
};

function mediaKind(fileName: string): 'image' | 'video' | null {
  if (isImage(fileName)) return 'image';
  if (isVideo(fileName)) return 'video';
  return null;
}

function buildMediaSrc(file: DirEntry, fileIndex: number) {
  const size = file.size ?? 0;
  return `/sfdownload/${fileIndex}/${size}/${encodeURIComponent(file.relativePath)}`;
}

function ChevronLeftIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5L8 12l7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadProgressBar({
  progress,
}: {
  progress: { percent: number; done: boolean };
}) {
  return (
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
  );
}

function MediaLightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: MediaPreview[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const preview = items[index];
  const canCycle = items.length > 1;

  const goPrev = useCallback(() => {
    if (!canCycle) return;
    onIndexChange((index - 1 + items.length) % items.length);
  }, [canCycle, index, items.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (!canCycle) return;
    onIndexChange((index + 1) % items.length);
  }, [canCycle, index, items.length, onIndexChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, goPrev, goNext]);

  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[rgba(10,16,13,0.92)] sf-fade"
      role="dialog"
      aria-modal="true"
      aria-label={preview.name}
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white/90">
            {preview.name}
          </p>
          {canCycle && (
            <p className="mt-0.5 text-xs text-white/50">
              {index + 1} / {items.length}
            </p>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-sm px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
          aria-label="Close preview"
        >
          Close
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:px-20 sm:py-8">
        {canCycle && (
          <button
            type="button"
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous preview"
          >
            <ChevronLeftIcon />
          </button>
        )}

        {preview.kind === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={preview.src}
            src={preview.src}
            alt={preview.name}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <video
            key={preview.src}
            className="max-h-full max-w-full bg-black"
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
          >
            <source src={preview.src} />
          </video>
        )}

        {canCycle && (
          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next preview"
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
    </div>
  );
}

function useFileDownload(
  fileIndex: number,
  size: number,
  downloadName: string,
  onDownloadStart: (fileIndex: number) => void
) {
  const [download, setDownload] = useState(false);

  const triggerDownload = () => {
    onDownloadStart(fileIndex);
    setDownload(false);
    setTimeout(() => setDownload(true), 150);
  };

  const downloadFrame = download ? (
    <iframe
      title={`download-${fileIndex}`}
      src={`/sfdownload/${fileIndex}/${size}/${downloadName}`}
      className="hidden"
      width={0}
      height={0}
    />
  ) : null;

  return { triggerDownload, downloadFrame };
}

function FileRow({
  file,
  fileIndex,
  progress,
  onDownloadStart,
  onPreview,
}: {
  file: DirEntry;
  fileIndex: number;
  progress?: { percent: number; done: boolean } | null;
  onDownloadStart: (fileIndex: number) => void;
  onPreview: (fileIndex: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const size = file.size ?? 0;
  const downloadName = encodeURIComponent(file.relativePath);
  const { triggerDownload, downloadFrame } = useFileDownload(
    fileIndex,
    size,
    downloadName,
    onDownloadStart
  );
  const mediaSrc = buildMediaSrc(file, fileIndex);
  const kind = mediaKind(file.name);

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
          {kind === 'image' && (
            <button
              type="button"
              className="block max-w-full cursor-zoom-in rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sf-accent)]"
              onClick={() => onPreview(fileIndex)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaSrc}
                alt={file.name}
                className="max-h-80 max-w-full rounded-sm object-contain"
              />
            </button>
          )}
          {kind === 'video' && (
            <button
              type="button"
              className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sf-accent)]"
              onClick={() => onPreview(fileIndex)}
            >
              <video
                className="aspect-video w-full bg-[var(--sf-ink)]"
                muted
                playsInline
                preload="metadata"
              >
                <source src={mediaSrc} />
              </video>
            </button>
          )}

          <button
            type="button"
            className="bg-[var(--sf-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--sf-accent)]"
            onClick={triggerDownload}
          >
            Download
          </button>

          {progress && <DownloadProgressBar progress={progress} />}
          {downloadFrame}
        </div>
      )}
    </div>
  );
}

function FileTile({
  file,
  fileIndex,
  progress,
  onDownloadStart,
  onPreview,
}: {
  file: DirEntry;
  fileIndex: number;
  progress?: { percent: number; done: boolean } | null;
  onDownloadStart: (fileIndex: number) => void;
  onPreview: (fileIndex: number) => void;
}) {
  const size = file.size ?? 0;
  const downloadName = encodeURIComponent(file.relativePath);
  const { triggerDownload, downloadFrame } = useFileDownload(
    fileIndex,
    size,
    downloadName,
    onDownloadStart
  );
  const mediaSrc = buildMediaSrc(file, fileIndex);
  const kind = mediaKind(file.name);

  return (
    <div className="sf-panel flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-[var(--sf-bg-deep)]">
        {kind === 'image' ? (
          <button
            type="button"
            className="h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sf-accent)]"
            onClick={() => onPreview(fileIndex)}
            aria-label={`Preview ${file.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaSrc}
              alt={file.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ) : kind === 'video' ? (
          <button
            type="button"
            className="h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sf-accent)]"
            onClick={() => onPreview(fileIndex)}
            aria-label={`Preview ${file.name}`}
          >
            <video
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            >
              <source src={mediaSrc} />
            </video>
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--sf-ink-muted)]">
            <FileIcon />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--sf-ink)]" title={file.name}>
            {file.name}
          </p>
          <p className="mt-0.5 text-xs text-[var(--sf-ink-muted)]">
            {formatFileSize(String(size))}
          </p>
        </div>

        <button
          type="button"
          className="mt-auto bg-[var(--sf-ink)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--sf-accent)]"
          onClick={triggerDownload}
        >
          Download
        </button>

        {progress && <DownloadProgressBar progress={progress} />}
        {downloadFrame}
      </div>
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const trackedDownloadsRef = useRef<Set<number>>(new Set());
  const startedRef = useRef(false);
  const rtcClientRef = useRef<any>(null);
  const entriesLenRef = useRef(0);

  const closePreview = useCallback(() => setPreviewIndex(null), []);

  useEffect(() => {
    entriesLenRef.current = entries.length;
  }, [entries]);

  const requestDir = useCallback((path: string, offset = 0) => {
    const rtc = rtcClientRef.current;
    if (!rtc) return;
    setPreviewIndex(null);
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

  const previewable = useMemo<MediaPreview[]>(() => {
    const fileEntries = entries.filter((e) => e.type === 'file');
    return fileEntries.flatMap((file, fileIndex) => {
      const kind = mediaKind(file.name);
      if (!kind) return [];
      return [
        {
          fileIndex,
          name: file.name,
          src: buildMediaSrc(file, fileIndex),
          kind,
        },
      ];
    });
  }, [entries]);

  const openPreview = useCallback(
    (fileIndex: number) => {
      const i = previewable.findIndex((item) => item.fileIndex === fileIndex);
      if (i >= 0) setPreviewIndex(i);
    },
    [previewable]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-20">
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
          <div className="flex flex-wrap items-center justify-between gap-3">
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

            <div
              className="sf-panel inline-flex overflow-hidden p-0.5"
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-[var(--sf-ink)] text-white'
                    : 'text-[var(--sf-ink-muted)] hover:text-[var(--sf-ink)]'
                }`}
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                <ListViewIcon />
                List
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'tile'
                    ? 'bg-[var(--sf-ink)] text-white'
                    : 'text-[var(--sf-ink-muted)] hover:text-[var(--sf-ink)]'
                }`}
                aria-pressed={viewMode === 'tile'}
                onClick={() => setViewMode('tile')}
              >
                <TileViewIcon />
                Tiles
              </button>
            </div>
          </div>

          {listingLoading ? (
            <div className="sf-panel px-6 py-10 text-center text-[var(--sf-ink-muted)]">
              Loading folder…
            </div>
          ) : entries.length === 0 ? (
            <div className="sf-panel px-6 py-10 text-center text-[var(--sf-ink-muted)]">
              This folder is empty.
            </div>
          ) : viewMode === 'list' ? (
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
                  onPreview={openPreview}
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
          ) : (
            <div className="space-y-4">
              {directories.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {directories.map((dir) => (
                    <button
                      key={dir.relativePath}
                      type="button"
                      className="sf-panel flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition hover:bg-white/70"
                      onClick={() => requestDir(dir.relativePath)}
                    >
                      <span className="text-[var(--sf-accent)]">
                        <FolderIcon />
                      </span>
                      <span className="line-clamp-2 break-all text-sm font-medium text-[var(--sf-ink)]">
                        {dir.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {files.map((file, fileIndex) => (
                    <FileTile
                      key={file.relativePath}
                      file={file}
                      fileIndex={fileIndex}
                      progress={downloadProgress[fileIndex]}
                      onDownloadStart={(i) => trackedDownloadsRef.current.add(i)}
                      onPreview={openPreview}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
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
              )}
            </div>
          )}
        </div>
      )}

      {previewIndex !== null && previewable[previewIndex] && (
        <MediaLightbox
          items={previewable}
          index={previewIndex}
          onIndexChange={setPreviewIndex}
          onClose={closePreview}
        />
      )}
    </div>
  );
}
