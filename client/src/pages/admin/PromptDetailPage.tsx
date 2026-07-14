import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Trash2, Lock, ImageIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageParts';
import { Card, Badge } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { MODEL_SOURCES, type ImageRecord, type Prompt } from '@/types';

function UploadSlot({
  source,
  image,
  locked,
  onUpload,
  onDelete,
}: {
  source: (typeof MODEL_SOURCES)[number];
  image?: ImageRecord;
  locked: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (locked) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onUpload(file);
    },
    [locked, onUpload]
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{source.company}</p>
          <p className="text-xs text-[var(--color-ink-muted)]">{source.model}</p>
        </div>
        {locked && <Lock className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" />}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex aspect-square items-center justify-center overflow-hidden ${
          dragOver ? 'bg-[var(--color-accent-soft)]' : 'bg-[var(--color-canvas)]'
        }`}
      >
        {image ? (
          <img src={image.imageUrl} alt={`${source.company} ${source.model}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <UploadCloud className="h-6 w-6 text-[var(--color-ink-faint)]" />
            <p className="text-xs text-[var(--color-ink-muted)]">Drag & drop or click to upload</p>
            <p className="text-[10px] text-[var(--color-ink-faint)]">PNG, JPEG, WEBP up to 10MB</p>
          </div>
        )}
        {!locked && (
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = '';
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink-faint)]">
          {image ? `Uploaded ${new Date(image.createdAt).toLocaleDateString()}` : 'Not uploaded'}
        </span>
        {image && !locked && (
          <button onClick={onDelete} className="rounded-md p-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Card>
  );
}

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const { notify } = useToast();

  const load = () => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/prompts/${id}`)
      .then((res) => {
        setPrompt(res.data.prompt);
        setImages(res.data.images);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleUpload = async (modelKey: string, file: File) => {
    if (!id) return;
    setUploadingKey(modelKey);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await api.post(`/prompts/${id}/images/${modelKey}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify('Image uploaded.', 'success');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await api.delete(`/images/${imageId}`);
      notify('Image removed.', 'success');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to remove image.', 'error');
    }
  };

  if (loading || !prompt) {
    return (
      <div>
        <PageHeader title="Loading prompt…" />
      </div>
    );
  }

  const imageByKey = new Map(images.map((img) => [img.modelKey, img]));

  return (
    <div>
      <PageHeader
        title={prompt.promptTitle}
        description={`${prompt.festivalName} · ${prompt.state} · ${prompt.category}`}
        actions={
          <Link to="/admin/prompts" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            <ArrowLeft className="h-4 w-4" /> Back to prompts
          </Link>
        }
      />
      <div className="grid gap-6 p-8 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1 h-fit">
          <div className="mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[var(--color-accent)]" />
            <p className="text-sm font-semibold text-[var(--color-ink)]">Prompt brief</p>
            {prompt.isLocked && <Badge tone="warning">Locked</Badge>}
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Description</dt>
              <dd className="mt-1 text-[var(--color-ink)]">{prompt.promptDescription}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Full prompt</dt>
              <dd className="mt-1 text-[var(--color-ink-muted)] leading-relaxed">{prompt.fullPrompt}</dd>
            </div>
            {prompt.expectedCulturalElements && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Expected cultural elements</dt>
                <dd className="mt-1 text-[var(--color-ink-muted)] leading-relaxed">{prompt.expectedCulturalElements}</dd>
              </div>
            )}
            {prompt.commonFailureCases && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Common failure cases</dt>
                <dd className="mt-1 text-[var(--color-ink-muted)] leading-relaxed">{prompt.commonFailureCases}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="lg:col-span-2">
          <p className="mb-3 text-sm font-medium text-[var(--color-ink)]">
            Upload exactly 3 AI-generated images for this prompt — one per model.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {MODEL_SOURCES.map((source) => (
              <UploadSlot
                key={source.key}
                source={source}
                image={imageByKey.get(source.key)}
                locked={prompt.isLocked || uploadingKey === source.key}
                onUpload={(file) => handleUpload(source.key, file)}
                onDelete={() => {
                  const img = imageByKey.get(source.key);
                  if (img) handleDelete(img._id);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
