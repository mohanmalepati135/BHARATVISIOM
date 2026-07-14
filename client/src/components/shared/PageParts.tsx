import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'accent' | 'warm';
}) {
  const toneClasses =
    tone === 'accent'
      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
      : tone === 'warm'
      ? 'bg-[var(--color-data-warm-soft)] text-[var(--color-data-warm)]'
      : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)]';

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', toneClasses)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mono-figure mt-3 text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-ink-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[var(--color-border)]/60', className)} />;
}
