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

        <div className="sf-rise-delay-2 mt-12 flex flex-wrap items-center gap-6">
          <a
            href="#how-it-works"
            className="inline-flex items-center bg-[var(--sf-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--sf-accent)]"
          >
            How it works
          </a>
          <p className="max-w-xs text-sm text-[var(--sf-ink-muted)]">
            Open a share link from the desktop app to start browsing.
          </p>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative border-t border-[var(--sf-line)] bg-[rgba(255,255,255,0.35)]"
      >
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div>
            <h2 className="sf-display text-4xl text-[var(--sf-ink)] sm:text-5xl">
              Three steps
            </h2>
            <p className="mt-4 max-w-md text-[var(--sf-ink-muted)]">
              No uploads to the cloud. Files move peer-to-peer once you open the
              link.
            </p>
          </div>

          <ol className="space-y-8">
            <li className="border-l-2 border-[var(--sf-accent)] pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sf-accent)]">
                01
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--sf-ink)]">
                Share a folder
              </h3>
              <p className="mt-2 text-[var(--sf-ink-muted)]">
                Pick a folder in the ShareFolder desktop app and copy its link.
              </p>
            </li>
            <li className="border-l-2 border-[var(--sf-line)] pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sf-ink-muted)]">
                02
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--sf-ink)]">
                Open the link
              </h3>
              <p className="mt-2 text-[var(--sf-ink-muted)]">
                The browser connects to your running desktop app over WebRTC.
              </p>
            </li>
            <li className="border-l-2 border-[var(--sf-line)] pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sf-ink-muted)]">
                03
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--sf-ink)]">
                Browse and download
              </h3>
              <p className="mt-2 text-[var(--sf-ink-muted)]">
                Drill into subfolders and pull files straight from the host
                machine.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <footer className="border-t border-[var(--sf-line)] px-6 py-8 text-center text-sm text-[var(--sf-ink-muted)]">
        ShareFolder
      </footer>
    </main>
  );
}
