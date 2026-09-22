'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isShareRoute = pathname !== '/' && !pathname.startsWith('/api');

  return (
    <header
      className={`relative z-20 ${
        isHome ? 'absolute inset-x-0 top-0' : 'border-b border-[var(--sf-line)]'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="sf-display text-2xl text-[var(--sf-ink)] transition-opacity hover:opacity-70"
        >
          ShareFolder
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          {isHome ? (
            <a
              href="#download"
              className="text-[var(--sf-ink-muted)] transition-colors hover:text-[var(--sf-ink)]"
            >
              Download
            </a>
          ) : (
            <Link
              href="/#download"
              className="text-[var(--sf-ink-muted)] transition-colors hover:text-[var(--sf-ink)]"
            >
              Download
            </Link>
          )}
          {isShareRoute && (
            <Link
              href="/"
              className="text-[var(--sf-ink-muted)] transition-colors hover:text-[var(--sf-ink)]"
            >
              Home
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
