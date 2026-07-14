import { useEffect, useMemo, useState } from 'react';
import { Download, Search, Trophy } from 'lucide-react';
import { PageHeader, EmptyState, Skeleton } from '@/components/shared/PageParts';
import { Button } from '@/components/ui/Button';
import { Input, Badge, Card } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import type { LeaderboardEntry } from '@/types';

type SortKey = keyof Pick<LeaderboardEntry, 'averageOverallRating' | 'winRate' | 'promptAdherence' | 'culturalScore' | 'regionalScore'>;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('averageOverallRating');

  useEffect(() => {
    api
      .get('/analytics/leaderboard')
      .then((res) => setLeaderboard(res.data.leaderboard))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return leaderboard
      .filter((m) => m.model.toLowerCase().includes(search.toLowerCase()) || m.company.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [leaderboard, search, sortKey]);

  const handleExportCsv = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/leaderboard/export/csv`, '_blank');
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'averageOverallRating', label: 'Overall rating' },
    { key: 'winRate', label: 'Win rate' },
    { key: 'promptAdherence', label: 'Prompt adherence' },
    { key: 'culturalScore', label: 'Cultural score' },
    { key: 'regionalScore', label: 'Regional score' },
  ];

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Ranked model performance across all evaluation sessions."
        actions={
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <div className="p-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <Input placeholder="Search model or company..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-96" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Trophy} title="No evaluation data yet" description="The leaderboard populates once participants start submitting responses." />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                  <th className="px-6 py-3 font-medium">Rank</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      onClick={() => setSortKey(c.key)}
                      className={`cursor-pointer px-6 py-3 font-medium ${sortKey === c.key ? 'text-[var(--color-accent)]' : ''}`}
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 font-medium">Evaluations</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.modelKey} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-6 py-4">
                      <Badge tone={i === 0 ? 'accent' : 'default'}>#{i + 1}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--color-ink)]">{m.model}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">{m.company}</p>
                    </td>
                    <td className="mono-figure px-6 py-4 text-[var(--color-ink)]">{m.averageOverallRating.toFixed(2)}</td>
                    <td className="mono-figure px-6 py-4 text-[var(--color-ink)]">{m.winRate}%</td>
                    <td className="mono-figure px-6 py-4 text-[var(--color-ink)]">{m.promptAdherence.toFixed(2)}</td>
                    <td className="mono-figure px-6 py-4 text-[var(--color-ink)]">{m.culturalScore.toFixed(2)}</td>
                    <td className="mono-figure px-6 py-4 text-[var(--color-ink)]">{m.regionalScore.toFixed(2)}</td>
                    <td className="mono-figure px-6 py-4 text-[var(--color-ink-muted)]">{m.totalEvaluations}</td>
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
