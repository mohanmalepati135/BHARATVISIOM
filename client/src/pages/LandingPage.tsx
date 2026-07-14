import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Users2, LineChart, ArrowRight, ScanEye } from 'lucide-react';

const FEATURES = [
  {
    icon: Eye,
    title: 'Blind evaluation',
    description:
      'Every image is shown only as A, B, or C. Model and company identity are hidden until the session closes.',
  },
  {
    icon: Users2,
    title: 'Human feedback',
    description:
      'Real evaluators score cultural authenticity, regional accuracy, and prompt adherence across six dimensions.',
  },
  {
    icon: LineChart,
    title: 'Research analytics',
    description:
      'Compare models festival by festival, state by state, with exportable leaderboards for every research cycle.',
  },
];

const TIMELINE = [
  { label: 'Prompt', detail: 'A festival, state, and cultural brief is defined' },
  { label: 'Image upload', detail: 'Three AI-generated images are attached, one per model' },
  { label: 'Blind evaluation', detail: 'Participants score each image without knowing its source' },
  { label: 'Analytics', detail: 'Scores are aggregated across dimensions and geographies' },
  { label: 'Leaderboard', detail: 'Model identity is revealed and ranked' },
];

function BlindSlot({ letter, delay }: { letter: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="relative flex h-40 w-full flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm sm:h-52"
    >
      <div className="absolute inset-3 rounded-[calc(var(--radius-card)-6px)] bg-[repeating-linear-gradient(135deg,var(--color-canvas)_0px,var(--color-canvas)_8px,transparent_8px,transparent_16px)] opacity-60" />
      <span className="font-display relative text-3xl font-bold text-[var(--color-ink-faint)]">{letter}</span>
      <span className="relative mt-1 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-faint)]">
        identity hidden
      </span>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] font-display text-sm font-bold text-white">
            BV
          </div>
          <span className="font-display text-sm font-semibold text-[var(--color-ink)]">BharatVision</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/admin/login" className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            Admin
          </Link>
          <Link
            to="/login"
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-border-strong)]"
          >
            Participant login
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-ink-muted)]">
            <ScanEye className="h-3.5 w-3.5" /> Internal research platform · Josh Talks AI
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold leading-[1.08] text-[var(--color-ink)] sm:text-5xl">
            BharatVision
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-ink-muted)]">
            Evaluate how well AI image generation models understand Indian culture through structured human
            evaluation.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-accent-hover)]"
            >
              Start evaluation <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-border-strong)]"
            >
              Learn more
            </a>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-3">
            <BlindSlot letter="A" delay={0.05} />
            <BlindSlot letter="B" delay={0.15} />
            <BlindSlot letter="C" delay={0.25} />
          </div>
          <p className="mt-3 text-center text-xs text-[var(--color-ink-muted)]">
            Three images, one prompt, zero bias — participants never see which model made what.
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-muted)]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">How an evaluation cycle runs</h2>
        <div className="mt-8 grid gap-0 sm:grid-cols-5">
          {TIMELINE.map((step, i) => (
            <div key={step.label} className="relative border-t-2 border-[var(--color-border)] pt-4 sm:px-3">
              {i < TIMELINE.length - 1 && (
                <div className="absolute -right-1.5 top-[-5px] hidden h-2 w-2 rotate-45 border-r-2 border-t-2 border-[var(--color-border)] sm:block" />
              )}
              <p className="font-display text-sm font-semibold text-[var(--color-ink)]">{step.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-muted)]">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-xs text-[var(--color-ink-muted)]">
          <span>© {new Date().getFullYear()} Josh Talks AI. Internal use only.</span>
          <span>BharatVision Evaluation Platform</span>
        </div>
      </footer>
    </div>
  );
}
