import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Expand, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Textarea } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { RatingSlider } from '@/components/ui/RatingSlider';
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { DEFAULT_SCORES, SCORE_LABELS, type ScoreSet } from '@/types';

type Slot = 'imageA' | 'imageB' | 'imageC';
const SLOTS: Slot[] = ['imageA', 'imageB', 'imageC'];

interface CurrentPromptResponse {
  isComplete: boolean;
  submittedCount: number;
  totalPrompts: number;
  session?: { id: string; name: string; category: string };
  prompt?: { id: string; festivalName: string; state: string; promptTitle: string; promptDescription: string; fullPrompt: string };
  images?: Record<Slot, { imageUrl: string }>;
}

export default function EvaluationPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [data, setData] = useState<CurrentPromptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<Slot, ScoreSet>>({
    imageA: { ...DEFAULT_SCORES },
    imageB: { ...DEFAULT_SCORES },
    imageC: { ...DEFAULT_SCORES },
  });
  const [activeTab, setActiveTab] = useState<Slot>('imageA');
  const [bestImage, setBestImage] = useState<Slot | null>(null);
  const [comments, setComments] = useState('');
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());

  const load = () => {
    if (!sessionId) return;
    setLoading(true);
    api
      .get(`/evaluation/sessions/${sessionId}/current`)
      .then((res) => {
        setData(res.data);
        setScores({ imageA: { ...DEFAULT_SCORES }, imageB: { ...DEFAULT_SCORES }, imageC: { ...DEFAULT_SCORES } });
        setBestImage(null);
        setComments('');
        setActiveTab('imageA');
        setStartedAt(Date.now());
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [sessionId]);

  const updateScore = (slot: Slot, key: keyof ScoreSet, value: number) =>
    setScores((prev) => ({ ...prev, [slot]: { ...prev[slot], [key]: value } }));

  const handleSubmit = async () => {
    if (!bestImage) {
      notify('Please select the image you found best overall.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/evaluation/responses', {
        sessionId,
        promptId: data?.prompt?.id,
        scores,
        bestImage,
        comments,
        completionTimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      });
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to submit response.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-sm text-[var(--color-ink-muted)]">Loading evaluation…</div>;
  }

  if (!data) return null;

  if (data.isComplete) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]"
        >
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">Evaluation complete</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Thank you — your responses have been saved successfully.
        </p>
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
          {data.submittedCount} of {data.totalPrompts} prompts evaluated.
        </p>
        <Button className="mt-6" onClick={() => navigate('/participant')}>
          Back to your evaluations
        </Button>
      </div>
    );
  }

  const { prompt, images, session, submittedCount, totalPrompts } = data;
  if (!prompt || !images) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {preview && <ImagePreviewModal url={preview.url} label={preview.label} onClose={() => setPreview(null)} />}

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
          <span>{session?.name}</span>
          <span>
            Prompt {submittedCount + 1} of {totalPrompts}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all"
            style={{ width: `${(submittedCount / totalPrompts) * 100}%` }}
          />
        </div>
      </div>

      <Card className="mb-6 p-6">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="accent">{prompt.festivalName}</Badge>
          <Badge>{prompt.state}</Badge>
        </div>
        <h1 className="font-display text-lg font-semibold text-[var(--color-ink)]">{prompt.promptTitle}</h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{prompt.promptDescription}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SLOTS.map((slot) => (
          <div key={slot} className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="relative aspect-square overflow-hidden">
              <img
                src={images[slot]?.imageUrl}
                alt={`Image ${slot.slice(-1)}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                onClick={() => setPreview({ url: images[slot]!.imageUrl, label: `Image ${slot.slice(-1)}` })}
                className="absolute right-2 top-2 rounded-md bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Expand className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-display text-sm font-semibold text-[var(--color-ink)]">Image {slot.slice(-1)}</span>
              <button
                onClick={() => setActiveTab(slot)}
                className={`text-xs font-medium ${activeTab === slot ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'}`}
              >
                Rate this image
              </button>
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <div className="mb-4 flex gap-1.5">
          {SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setActiveTab(slot)}
              className={`rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === slot
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              Image {slot.slice(-1)}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {SCORE_LABELS.map((s) => (
            <RatingSlider
              key={s.key}
              label={s.label}
              help={s.help}
              value={scores[activeTab][s.key]}
              onChange={(v) => updateScore(activeTab, s.key, v)}
            />
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Which image did you find best overall?</p>
        <div className="flex gap-2">
          {SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setBestImage(slot)}
              className={`flex-1 rounded-[var(--radius-control)] border py-2.5 text-sm font-medium transition-colors ${
                bestImage === slot
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              Image {slot.slice(-1)}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">Comments (optional)</label>
          <Textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Any observations about cultural accuracy, errors, or standout details…" />
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleSubmit} loading={submitting}>
            Next prompt <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
