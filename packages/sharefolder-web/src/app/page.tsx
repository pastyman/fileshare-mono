import {
  SHAREFOLDER_DOWNLOADS,
  SHAREFOLDER_INSTALL_GUIDES,
  SHAREFOLDER_RELEASES_URL,
  sharefolderDownloadUrl,
} from '@/lib/downloads';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="sf-drift pointer-events-none absolute -right-24 top-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,#b7dccb_0%,transparent_70%)] opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-10 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,#c5d3e4_0%,transparent_70%)] opacity-70"
      />

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pb-24 pt-28">
        <p className="sf-rise mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--sf-accent)]">
          Local folders, open on the web
        </p>

        <h1 className="sf-display sf-rise-delay max-w-4xl text-6xl text-[var(--sf-ink)] sm:text-7xl md:text-8xl">
          ShareFolder
        </h1>

        <p className="sf-rise-delay-2 mt-8 max-w-xl text-lg leading-relaxed text-[var(--sf-ink-muted)] sm:text-xl">
          Share a folder from the desktop app. Anyone with the link can browse
          and download files through a direct peer connection.
        </p>

        <div className="sf-rise-delay-2 mt-12 flex flex-wrap items-center gap-4">
          <a
            href="#download"
            className="inline-flex items-center bg-[var(--sf-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--sf-accent)]"
          >
            Download the app
          </a>
          <a
            href="/how-it-works"
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[var(--sf-ink)] transition hover:text-[var(--sf-accent)]"
          >
            How it works
          </a>
        </div>
      </section>

      <section
        id="download"
        className="relative border-t border-[var(--sf-line)] bg-[rgba(255,255,255,0.35)]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="sf-display text-4xl text-[var(--sf-ink)] sm:text-5xl">
            Download
          </h2>
          <p className="mt-4 max-w-xl text-[var(--sf-ink-muted)]">
            Install ShareFolder on your computer, share a folder, and open the
            link from any browser.
          </p>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SHAREFOLDER_DOWNLOADS.map((item) => (
              <li key={item.id}>
                <a
                  href={sharefolderDownloadUrl(item.file)}
                  className="flex h-full flex-col justify-between border border-[var(--sf-line)] bg-white/70 px-5 py-6 transition hover:border-[var(--sf-accent)] hover:bg-white"
                >
                  <span>
                    <span className="block text-lg font-semibold text-[var(--sf-ink)]">
                      {item.label}
                    </span>
                    <span className="mt-2 block text-sm text-[var(--sf-ink-muted)]">
                      {item.hint}
                    </span>
                  </span>
                  <span className="mt-6 text-sm font-semibold text-[var(--sf-accent)]">
                    Download
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {SHAREFOLDER_INSTALL_GUIDES.map((guide) => (
              <div key={guide.id}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sf-accent)]">
                  {guide.label}
                </h3>
                <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-[var(--sf-ink-muted)]">
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-[var(--sf-ink-muted)]">
            All builds:{' '}
            <a
              href={SHAREFOLDER_RELEASES_URL}
              className="font-medium text-[var(--sf-ink)] underline-offset-2 hover:underline"
            >
              GitHub Releases
            </a>
            .
          </p>
        </div>
      </section>

      <section className="relative border-t border-[var(--sf-line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="sf-display text-4xl text-[var(--sf-ink)] sm:text-5xl">
              See the path
            </h2>
            <p className="mt-4 text-[var(--sf-ink-muted)]">
              Watch signaling through ShareFolder servers, then a direct
              peer-to-peer handoff — files never upload to the cloud.
            </p>
          </div>
          <a
            href="/how-it-works"
            className="inline-flex items-center self-start border border-[var(--sf-ink)] px-6 py-3 text-sm font-semibold text-[var(--sf-ink)] transition hover:border-[var(--sf-accent)] hover:text-[var(--sf-accent)]"
          >
            How it works
          </a>
        </div>
      </section>

      <footer className="border-t border-[var(--sf-line)] px-6 py-8 text-center text-sm text-[var(--sf-ink-muted)]">
        ShareFolder
      </footer>
    </main>
  );
}
