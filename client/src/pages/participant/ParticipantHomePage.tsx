import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PlayCircle, Sparkles } from 'lucide-react';
import { Card, Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { EmptyState, Skeleton } from '@/components/shared/PageParts';
import { api } from '@/lib/api';

interface SessionProgress {
  id: string;
  name: string;
  category: string;
  description?: string;
  totalPrompts: number;
  submittedCount: number;
  isComplete: boolean;
}

export default function ParticipantHomePage() {
  const [sessions, setSessions] = useState<SessionProgress[]>([]);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/evaluation/me/profile'), api.get('/evaluation/me/sessions')])
      .then(([profileRes, sessionsRes]) => {
        setConsentGiven(profileRes.data.participant.consentGiven);
        setSessions(sessionsRes.data.sessions);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (consentGiven === false) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">Before you begin</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          We need a short consent form from you before assigning any evaluation sessions.
        </p>
        <Link to="/participant/consent">
          <Button className="mt-6">Complete consent form</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">Your evaluations</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Sessions assigned to you by the BharatVision research team.</p>

      <div className="mt-6 space-y-3">
        {sessions.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No sessions assigned yet"
            description="You'll see evaluation sessions here as soon as the research team assigns them to you."
          />
        ) : (
          sessions.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">{s.name}</h3>
                  {s.isComplete && <Badge tone="success">Complete</Badge>}
                </div>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{s.description || s.category}</p>
                <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                  {s.submittedCount} of {s.totalPrompts} prompts evaluated
                </p>
              </div>
              <Link to={`/participant/evaluate/${s.id}`}>
                <Button variant={s.isComplete ? 'secondary' : 'primary'}>
                  {s.isComplete ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  {s.isComplete ? 'Review' : s.submittedCount > 0 ? 'Resume' : 'Start evaluation'}
                </Button>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
