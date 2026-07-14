import { useEffect, useState } from 'react';
import { Users, CheckCircle2, Clock, FileText, ImageIcon, Star, Trophy, Gauge } from 'lucide-react';
import { PageHeader, StatCard, Skeleton } from '@/components/shared/PageParts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/dashboard')
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of BharatVision evaluation activity." />
      <div className="p-8 space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <StatCard label="Total participants" value={stats.totalParticipants} icon={Users} tone="accent" />
              <StatCard label="Completed evaluations" value={stats.completedEvaluations} icon={CheckCircle2} />
              <StatCard label="Pending evaluations" value={stats.pendingEvaluations} icon={Clock} />
              <StatCard label="Total prompts" value={stats.totalPrompts} icon={FileText} />
              <StatCard label="Uploaded images" value={stats.totalUploadedImages} icon={ImageIcon} />
              <StatCard label="Avg. evaluation score" value={stats.averageEvaluationScore.toFixed(1)} icon={Star} tone="warm" />
              <StatCard label="Most preferred model" value={stats.mostPreferredModel} icon={Trophy} tone="accent" />
              <StatCard label="Completion rate" value={`${stats.completionRate}%`} icon={Gauge} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Latest responses</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {stats.latestResponses.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-[var(--color-ink-muted)]">No responses submitted yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                        <th className="px-6 py-3 font-medium">Participant</th>
                        <th className="px-6 py-3 font-medium">Prompt</th>
                        <th className="px-6 py-3 font-medium">Festival</th>
                        <th className="px-6 py-3 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.latestResponses.map((r) => (
                        <tr key={r.id} className="border-t border-[var(--color-border)]">
                          <td className="px-6 py-3 text-[var(--color-ink)]">{r.participantName || '—'}</td>
                          <td className="px-6 py-3 text-[var(--color-ink-muted)]">{r.promptTitle || '—'}</td>
                          <td className="px-6 py-3 text-[var(--color-ink-muted)]">{r.festivalName || '—'}</td>
                          <td className="px-6 py-3 mono-figure text-[var(--color-ink-muted)]">
                            {new Date(r.submittedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
