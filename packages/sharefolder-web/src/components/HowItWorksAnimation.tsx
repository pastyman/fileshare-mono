'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  {
    id: 'share',
    label: '01',
    title: 'Share a folder',
    body: 'Your desktop app keeps the files local and publishes a share link.',
    status: 'Host online · folder ready',
  },
  {
    id: 'open',
    label: '02',
    title: 'Someone opens the link',
    body: 'Their browser loads ShareFolder and asks to meet your app.',
    status: 'Guest arrived · requesting join',
  },
  {
    id: 'signal',
    label: '03',
    title: 'Signaling, not storage',
    body: 'ShareFolder servers only pass tiny handshake messages — offers, answers, and ICE candidates. Your files never upload.',
    status: 'Signaling · SDP + ICE exchange',
  },
  {
    id: 'peer',
    label: '04',
    title: 'Peer link locks in',
    body: 'Once both sides agree on a route, a direct WebRTC connection opens between their devices.',
    status: 'WebRTC connected · peer path live',
  },
  {
    id: 'transfer',
    label: '05',
    title: 'Files move peer-to-peer',
    body: 'Browse and download straight from the host machine. The server steps aside — introductions only.',
    status: 'P2P transfer · server idle',
  },
] as const;

const STEP_MS = 3800;

export function HowItWorksAnimation() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const active = STEPS[step];
  const signaling = step === 2;
  const peerLive = step >= 3;
  const transferring = step === 4;

  return (
    <div className="grid gap-12 xl:grid-cols-[1.35fr_0.85fr] xl:items-start xl:gap-14">
      <div
        className="sf-scene relative overflow-hidden border border-[var(--sf-line)] bg-[rgba(255,255,255,0.58)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(31,107,79,0.10),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(197,211,228,0.42),transparent_46%)]" />
        <div className="sf-grid-fade pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative flex items-center justify-between gap-3 border-b border-[var(--sf-line)] px-5 py-3 sm:px-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sf-ink-muted)]">
            live path
          </p>
          <p
            key={active.status}
            className="sf-status-flash truncate font-mono text-[11px] text-[var(--sf-accent)] sm:text-xs"
          >
            {active.status}
          </p>
        </div>

        <div className="relative px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
          <svg
            className="mx-auto h-auto w-full max-w-3xl"
            viewBox="0 0 840 420"
            role="presentation"
          >
            <defs>
              <linearGradient id="sfSignalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1f6b4f" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#1f6b4f" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1f6b4f" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="sfPeerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1f6b4f" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#14201a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1f6b4f" stopOpacity="0.2" />
              </linearGradient>
              <filter id="sfGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Host → Server */}
            <path
              d="M 170 210 C 250 210, 300 110, 420 110"
              className={signaling ? 'sf-dash-flow-path' : undefined}
              fill="none"
              stroke={
                signaling ? 'url(#sfSignalGrad)' : step > 2 ? 'rgba(20,32,26,0.08)' : 'rgba(20,32,26,0.12)'
              }
              strokeWidth="2"
              strokeDasharray={signaling ? '5 7' : undefined}
              opacity={step > 2 && !signaling ? 0.55 : 1}
            />
            {/* Guest → Server */}
            <path
              d="M 670 210 C 590 210, 540 110, 420 110"
              className={signaling ? 'sf-dash-flow-path' : undefined}
              fill="none"
              stroke={
                signaling ? 'url(#sfSignalGrad)' : step > 2 ? 'rgba(20,32,26,0.08)' : 'rgba(20,32,26,0.12)'
              }
              strokeWidth="2"
              strokeDasharray={signaling ? '5 7' : undefined}
              opacity={step > 2 && !signaling ? 0.55 : 1}
            />
            {/* Direct peer arc */}
            <path
              d="M 170 240 C 300 360, 540 360, 670 240"
              fill="none"
              stroke={peerLive ? 'url(#sfPeerGrad)' : 'rgba(20,32,26,0.12)'}
              strokeWidth={peerLive ? 3 : 1.5}
              strokeDasharray={peerLive ? undefined : '6 10'}
              filter={peerLive ? 'url(#sfGlow)' : undefined}
            />

            {signaling && (
              <>
                <circle r="5" fill="#1f6b4f" filter="url(#sfGlow)">
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path="M 170 210 C 250 210, 300 110, 420 110"
                  />
                </circle>
                <circle r="5" fill="#1f6b4f" filter="url(#sfGlow)">
                  <animateMotion
                    dur="1.5s"
                    begin="0.35s"
                    repeatCount="indefinite"
                    path="M 670 210 C 590 210, 540 110, 420 110"
                  />
                </circle>
                <circle r="4" fill="#14201a" opacity="0.85">
                  <animateMotion
                    dur="1.5s"
                    begin="0.7s"
                    repeatCount="indefinite"
                    path="M 420 110 C 300 110, 250 210, 170 210"
                  />
                </circle>
                <circle r="4" fill="#14201a" opacity="0.85">
                  <animateMotion
                    dur="1.5s"
                    begin="1.05s"
                    repeatCount="indefinite"
                    path="M 420 110 C 540 110, 590 210, 670 210"
                  />
                </circle>
              </>
            )}

            {transferring && (
              <>
                <circle r="6" fill="#1f6b4f" filter="url(#sfGlow)">
                  <animateMotion
                    dur="1.8s"
                    repeatCount="indefinite"
                    path="M 170 240 C 300 360, 540 360, 670 240"
                  />
                </circle>
                <circle r="5" fill="#1f6b4f" opacity="0.75">
                  <animateMotion
                    dur="1.8s"
                    begin="0.45s"
                    repeatCount="indefinite"
                    path="M 170 240 C 300 360, 540 360, 670 240"
                  />
                </circle>
                <circle r="4" fill="#14201a" opacity="0.7">
                  <animateMotion
                    dur="1.8s"
                    begin="0.9s"
                    repeatCount="indefinite"
                    path="M 670 240 C 540 360, 300 360, 170 240"
                  />
                </circle>
              </>
            )}

            {/* Server node */}
            <g transform="translate(420, 110)">
              <circle
                r={signaling ? 46 : 40}
                className={`transition-all duration-500 ${
                  signaling
                    ? 'fill-[var(--sf-accent-soft)] stroke-[var(--sf-accent)]'
                    : peerLive
                      ? 'fill-white/80 stroke-[var(--sf-line)]'
                      : 'fill-white stroke-[var(--sf-line)]'
                }`}
                strokeWidth="2"
              />
              {signaling && (
                <circle
                  r="54"
                  fill="none"
                  stroke="#1f6b4f"
                  strokeOpacity="0.35"
                  className="sf-ring-pulse"
                />
              )}
              <text
                textAnchor="middle"
                y="-6"
                className="fill-[var(--sf-ink)]"
                style={{ fontSize: 12, fontWeight: 700 }}
              >
                ShareFolder
              </text>
              <text
                textAnchor="middle"
                y="12"
                className="fill-[var(--sf-ink-muted)]"
                style={{ fontSize: 10, letterSpacing: '0.12em' }}
              >
                {signaling ? 'SIGNALING' : peerLive ? 'INTRO ONLY' : 'SERVER'}
              </text>
            </g>

            {/* Host node */}
            <g transform="translate(120, 210)">
              <rect
                x="-78"
                y="-58"
                width="156"
                height="116"
                className={`transition duration-500 ${
                  step === 0 || signaling || transferring
                    ? 'fill-white stroke-[var(--sf-accent)]'
                    : 'fill-white/85 stroke-[var(--sf-line)]'
                }`}
                strokeWidth="2"
              />
              <text
                x="-66"
                y="-34"
                className="fill-[var(--sf-ink-muted)]"
                style={{ fontSize: 9, letterSpacing: '0.16em', fontWeight: 600 }}
              >
                YOUR COMPUTER
              </text>
              <text
                x="-66"
                y="-14"
                className="fill-[var(--sf-ink)]"
                style={{ fontSize: 14, fontWeight: 700 }}
              >
                Desktop app
              </text>
              <rect
                x="-66"
                y="4"
                width="36"
                height="28"
                className={step >= 0 ? 'fill-[var(--sf-accent)]' : 'fill-[var(--sf-line)]'}
              />
              <rect
                x="-66"
                y="-2"
                width="16"
                height="8"
                className={
                  step >= 0 ? 'fill-[var(--sf-accent-soft)]' : 'fill-[rgba(20,32,26,0.12)]'
                }
              />
              <text
                x="-22"
                y="22"
                className="fill-[var(--sf-ink-muted)]"
                style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
              >
                /photos
              </text>
              {step >= 0 && (
                <text
                  x="-66"
                  y="46"
                  className="fill-[var(--sf-accent)]"
                  style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
                >
                  sharefolder.io/a1…/f9…
                </text>
              )}
            </g>

            {/* Guest node */}
            <g transform="translate(720, 210)">
              <rect
                x="-78"
                y="-58"
                width="156"
                height="116"
                className={`transition duration-500 ${
                  step >= 1
                    ? step === 1 || signaling || transferring
                      ? 'fill-white stroke-[var(--sf-accent)]'
                      : 'fill-white/85 stroke-[var(--sf-line)]'
                    : 'fill-white/70 stroke-[var(--sf-line)]'
                }`}
                strokeWidth="2"
              />
              <text
                x="-66"
                y="-34"
                className="fill-[var(--sf-ink-muted)]"
                style={{ fontSize: 9, letterSpacing: '0.16em', fontWeight: 600 }}
              >
                THEIR DEVICE
              </text>
              <text
                x="-66"
                y="-14"
                className="fill-[var(--sf-ink)]"
                style={{ fontSize: 14, fontWeight: 700 }}
              >
                Browser
              </text>
              <rect
                x="-66"
                y="0"
                width="88"
                height="40"
                className={step >= 1 ? 'stroke-[var(--sf-accent)]' : 'stroke-[var(--sf-line)]'}
                fill="none"
                strokeWidth="1.5"
              />
              <line
                x1="-66"
                y1="10"
                x2="22"
                y2="10"
                className="stroke-[var(--sf-line)]"
                strokeWidth="1"
              />
              {transferring ? (
                <>
                  <text x="-58" y="26" style={{ fontSize: 8 }} className="fill-[var(--sf-ink)]">
                    IMG_1042.jpg
                  </text>
                  <text x="8" y="26" style={{ fontSize: 8 }} className="fill-[var(--sf-accent)]">
                    ↓
                  </text>
                  <text x="-58" y="36" style={{ fontSize: 8 }} className="fill-[var(--sf-ink)]">
                    notes.pdf
                  </text>
                </>
              ) : (
                <text
                  x="-58"
                  y="30"
                  className="fill-[var(--sf-ink-muted)]"
                  style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace' }}
                >
                  {step >= 1 ? 'opening link…' : 'waiting'}
                </text>
              )}
            </g>

            {/* Peer path caption */}
            <g transform="translate(420, 340)">
              <rect
                x="-78"
                y="-14"
                width="156"
                height="28"
                className={
                  peerLive
                    ? 'fill-[var(--sf-accent-soft)] stroke-[var(--sf-accent)]'
                    : 'fill-white/80 stroke-[var(--sf-line)]'
                }
                strokeWidth="1.5"
              />
              <text
                textAnchor="middle"
                y="4"
                className={peerLive ? 'fill-[var(--sf-accent)]' : 'fill-[var(--sf-ink-muted)]'}
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em' }}
              >
                {peerLive ? 'DIRECT P2P PATH' : 'PEER PATH STANDBY'}
              </text>
            </g>
          </svg>

          <div className="mx-auto mt-2 grid max-w-3xl gap-2 px-2 sm:grid-cols-3">
            <LegendChip
              active={step === 0}
              label="Host keeps files"
              detail="Nothing uploaded"
            />
            <LegendChip
              active={signaling}
              label="Signaling only"
              detail="Tiny handshake messages"
            />
            <LegendChip
              active={transferring}
              label="Direct transfer"
              detail="Browser ↔ desktop"
            />
          </div>
        </div>
      </div>

      <div className="xl:sticky xl:top-28">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--sf-accent)]">
          How it works
        </p>
        <h1 className="sf-display mt-4 text-5xl text-[var(--sf-ink)] sm:text-6xl">
          Servers introduce. Peers deliver.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--sf-ink-muted)]">
          ShareFolder’s cloud is a matchmaker. After the handshake, your
          machines talk to each other.
        </p>

        <ol className="mt-10 space-y-3">
          {STEPS.map((item, index) => {
            const isActive = index === step;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(index);
                    setPaused(true);
                  }}
                  className={`w-full border-l-2 pl-4 text-left transition ${
                    isActive
                      ? 'border-[var(--sf-accent)]'
                      : 'border-[var(--sf-line)] opacity-50 hover:opacity-80'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      isActive
                        ? 'text-[var(--sf-accent)]'
                        : 'text-[var(--sf-ink-muted)]'
                    }`}
                  >
                    {item.label}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--sf-ink)] sm:text-xl">
                    {item.title}
                  </h2>
                  <p
                    className={`mt-1 text-sm leading-relaxed text-[var(--sf-ink-muted)] ${
                      isActive ? 'opacity-100' : 'hidden sm:block sm:opacity-70'
                    }`}
                  >
                    {item.body}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>

        <a
          href="/#download"
          className="mt-10 inline-flex items-center bg-[var(--sf-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--sf-accent)]"
        >
          Download the app
        </a>
      </div>
    </div>
  );
}

function LegendChip({
  active,
  label,
  detail,
}: {
  active: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div
      className={`border px-3 py-2 transition duration-500 ${
        active
          ? 'border-[var(--sf-accent)] bg-[var(--sf-accent-soft)]'
          : 'border-[var(--sf-line)] bg-white/60'
      }`}
    >
      <p className="text-xs font-semibold text-[var(--sf-ink)]">{label}</p>
      <p className="mt-0.5 text-[11px] text-[var(--sf-ink-muted)]">{detail}</p>
    </div>
  );
}
