import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { PageHeader, Skeleton } from '@/components/shared/PageParts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import type { LeaderboardEntry } from '@/types';

interface FestivalPerf {
  festivalName: string;
  state: string;
  averageScore: number;
  responseCount: number;
}
interface PromptStat {
  promptId: string;
  promptTitle: string;
  festivalName: string;
  averageScore: number;
}

const CHART_COLORS = ['#362F78', '#C2793D', '#1F7A4D'];

export default function AnalyticsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [festivalPerf, setFestivalPerf] = useState<FestivalPerf[]>([]);
  const [difficulty, setDifficulty] = useState<{ mostDifficult: PromptStat[]; highestRated: PromptStat[] }>({
    mostDifficult: [],
    highestRated: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/leaderboard'),
      api.get('/analytics/festival-performance'),
      api.get('/analytics/prompt-difficulty'),
    ])
      .then(([lb, fp, pd]) => {
        setLeaderboard(lb.data.leaderboard);
        setFestivalPerf(fp.data.data);
        setDifficulty({ mostDifficult: pd.data.mostDifficult, highestRated: pd.data.highestRated });
      })
      .finally(() => setLoading(false));
  }, []);

  const radarData = [
    'promptAdherence',
    'culturalScore',
    'regionalScore',
    'visualRealism',
    'overallPreference',
  ].map((key) => {
    const row: Record<string, string | number> = { dimension: key.replace(/([A-Z])/g, ' $1') };
    leaderboard.forEach((m) => {
      row[m.model] = (m as unknown as Record<string, number>)[key];
    });
    return row;
  });

  return (
    <div>
      <PageHeader title="Analytics" description="Model performance across cultural evaluation dimensions." />
      <div className="grid gap-6 p-8 lg:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80" />)
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Overall model comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={leaderboard}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="model" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="averageOverallRating" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dimension radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
                    {leaderboard.map((m, i) => (
                      <Radar key={m.modelKey} name={m.model} dataKey={m.model} stroke={CHART_COLORS[i % 3]} fill={CHART_COLORS[i % 3]} fillOpacity={0.15} />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Festival performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={festivalPerf} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="festivalName" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill={CHART_COLORS[1]} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most difficult vs. highest rated prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Most difficult
                  </p>
                  {difficulty.mostDifficult.map((p) => (
                    <div key={p.promptId} className="flex items-center justify-between border-b border-[var(--color-border)] py-1.5 text-sm last:border-0">
                      <span className="text-[var(--color-ink)]">{p.promptTitle}</span>
                      <span className="mono-figure text-[var(--color-danger)]">{p.averageScore.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Highest rated
                  </p>
                  {difficulty.highestRated.map((p) => (
                    <div key={p.promptId} className="flex items-center justify-between border-b border-[var(--color-border)] py-1.5 text-sm last:border-0">
                      <span className="text-[var(--color-ink)]">{p.promptTitle}</span>
                      <span className="mono-figure text-[var(--color-success)]">{p.averageScore.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
