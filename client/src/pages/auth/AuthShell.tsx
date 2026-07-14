import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] font-display text-sm font-bold text-white">
            BV
          </div>
          <span className="font-display text-sm font-semibold text-[var(--color-ink)]">BharatVision</span>
        </Link>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
          <h1 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-5 text-center text-sm text-[var(--color-ink-muted)]">{footer}</div>}
      </div>
    </div>
  );
}
