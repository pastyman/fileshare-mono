import type { Metadata } from 'next';
import { HowItWorksAnimation } from '@/components/HowItWorksAnimation';

export const metadata: Metadata = {
  title: 'How it works · ShareFolder',
  description:
    'See how ShareFolder servers handle signaling, then step aside for a direct peer-to-peer transfer.',
};

export default function HowItWorksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="sf-drift pointer-events-none absolute -right-16 top-28 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,#b7dccb_0%,transparent_70%)] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-16 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle_at_center,#c5d3e4_0%,transparent_70%)] opacity-60"
      />

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-28">
        <HowItWorksAnimation />
      </section>

      <footer className="border-t border-[var(--sf-line)] px-6 py-8 text-center text-sm text-[var(--sf-ink-muted)]">
        ShareFolder
      </footer>
    </main>
  );
}
