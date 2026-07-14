import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { PageHeader, EmptyState, Skeleton } from '@/components/shared/PageParts';
import { Input, Badge, Card } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import type { Participant } from '@/types';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api
        .get('/participants', { params: search ? { search } : {} })
        .then((res) => setParticipants(res.data.participants))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <PageHeader title="Participants" description="Everyone registered to evaluate BharatVision prompts." />
      <div className="p-8">
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-faint)]" />
          <Input placeholder="Search participants..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : participants.length === 0 ? (
          <EmptyState icon={Users} title="No participants yet" description="Participants will appear here once they register." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">State</th>
                  <th className="px-6 py-3 font-medium">Occupation</th>
                  <th className="px-6 py-3 font-medium">Consent</th>
                  <th className="px-6 py-3 font-medium">Responses</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p._id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-6 py-3 font-medium text-[var(--color-ink)]">{p.fullName}</td>
                    <td className="px-6 py-3 text-[var(--color-ink-muted)]">{p.email}</td>
                    <td className="px-6 py-3 text-[var(--color-ink-muted)]">{p.state || '—'}</td>
                    <td className="px-6 py-3 text-[var(--color-ink-muted)]">{p.occupation || '—'}</td>
                    <td className="px-6 py-3">
                      <Badge tone={p.consentGiven ? 'success' : 'default'}>{p.consentGiven ? 'Given' : 'Pending'}</Badge>
                    </td>
                    <td className="px-6 py-3 mono-figure text-[var(--color-ink)]">{p.responseCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
