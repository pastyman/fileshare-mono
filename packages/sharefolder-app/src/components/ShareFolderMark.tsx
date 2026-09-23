import * as React from 'react';

/** ShareFolder mark — matches packaged app icon. */
export function ShareFolderMark({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="sfMarkBg"
          x1="64"
          y1="32"
          x2="448"
          y2="480"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2a8f68" />
          <stop offset="1" stopColor="#1f6b4f" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#sfMarkBg)" />
      <path
        d="M118 198c0-18.778 15.222-34 34-34h58.5c9.05 0 17.6 3.84 23.6 10.5l18.4 20.5c6 6.66 14.55 10.5 23.6 10.5H360c18.778 0 34 15.222 34 34v124c0 18.778-15.222 34-34 34H152c-18.778 0-34-15.222-34-34V198z"
        fill="#f7faf8"
      />
      <path
        d="M118 230h276v116c0 18.778-15.222 34-34 34H152c-18.778 0-34-15.222-34-34V230z"
        fill="#e4ece7"
      />
      <circle cx="214" cy="292" r="22" fill="#1f6b4f" />
      <circle cx="298" cy="292" r="22" fill="#1f6b4f" />
      <path
        d="M236 292h40"
        stroke="#1f6b4f"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}
