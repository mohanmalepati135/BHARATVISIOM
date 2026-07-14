import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import { PageHeader, EmptyState, Skeleton } from '@/components/shared/PageParts';
import { Card, Badge, Select } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import type { EvaluationSession } from '@/types';

interface ResultRow {
  id: string;
  participant: { fullName: string; email: string };
  prompt: { promptTitle: string; festivalName: string };
  bestImage: string;
  bestModel?: string;
  comments: string;
  submittedAt: string;
  completionTimeSeconds?: number;
  revealedImages: Record<string, { company: string; model: string; imageUrl: string } | null>;
}

export default function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || '';
  const [sessions, setSessions] = useState<EvaluationSession[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/sessions').then((res) => setSessions(res.data.sessions));
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    api
      .get(`/results/sessions/${sessionId}`)
      .then((res) => setResults(res.data.results))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div>
      <PageHeader title="Evaluation results" description="Review individual responses with model identity revealed." />
      <div className="p-8">
        <div className="mb-5 max-w-sm">
          <Select value={sessionId} onChange={(e) => setSearchParams({ session: e.target.value })}>
            <option value="">Select an evaluation session…</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        {!sessionId ? (
          <EmptyState icon={ListChecks} title="Select a session" description="Choose an evaluation session above to review its submitted responses." />
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState icon={ListChecks} title="No responses yet" description="Responses will appear here once participants complete this session." />
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{r.prompt.promptTitle}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">
                      {r.prompt.festivalName} · {r.participant.fullName} ({r.participant.email})
                    </p>
                  </div>
                  <Badge tone="accent">Winner: {r.bestModel || r.bestImage}</Badge>
                </div>
                {r.comments && <p className="mt-3 text-sm italic text-[var(--color-ink-muted)]">“{r.comments}”</p>}
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  {(['imageA', 'imageB', 'imageC'] as const).map((slot) => (
                    <div key={slot} className={`rounded-md border px-2 py-1.5 ${r.bestImage === slot ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--color-border)]'}`}>
                      <p className="font-medium text-[var(--color-ink)]">{slot.replace('image', 'Image ')}</p>
                      <p className="text-[var(--color-ink-muted)]">{r.revealedImages[slot]?.company} · {r.revealedImages[slot]?.model}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-ink-faint)]">
                  Submitted {new Date(r.submittedAt).toLocaleString()}
                  {r.completionTimeSeconds ? ` · ${Math.round(r.completionTimeSeconds)}s` : ''}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
