import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Archive, ImageIcon, Lock } from 'lucide-react';
import { PageHeader, EmptyState, Skeleton } from '@/components/shared/PageParts';
import { Button } from '@/components/ui/Button';
import { Input, Badge } from '@/components/ui/primitives';
import { PromptFormModal } from '@/components/shared/PromptFormModal';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { Prompt } from '@/types';
import { FileText } from 'lucide-react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get('/prompts', { params: search ? { search } : {} })
      .then((res) => setPrompts(res.data.prompts))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt and its uploaded images? This cannot be undone.')) return;
    try {
      await api.delete(`/prompts/${id}`);
      notify('Prompt deleted.', 'success');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete prompt.', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.patch(`/prompts/${id}/archive`);
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to update prompt.', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Prompt management"
        description="Create and manage cultural evaluation prompts."
        actions={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Create prompt
          </Button>
        }
      />
      <div className="p-8">
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-faint)]" />
          <Input placeholder="Search prompts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No prompts yet"
            description="Create your first cultural evaluation prompt to get started."
            action={<Button onClick={() => setModalOpen(true)}>Create prompt</Button>}
          />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                  <th className="px-6 py-3 font-medium">Prompt</th>
                  <th className="px-6 py-3 font-medium">Festival / State</th>
                  <th className="px-6 py-3 font-medium">Images</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((p) => (
                  <tr key={p._id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--color-ink)]">{p.promptTitle}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{p.category}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-ink-muted)]">
                      {p.festivalName} · {p.state}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={p.imageCount === 3 ? 'success' : 'warning'}>{p.imageCount ?? 0} / 3</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={p.status === 'active' ? 'accent' : 'default'}>{p.status}</Badge>
                        {p.isLocked && (
                          <span title="Locked by a published session" className="text-[var(--color-ink-faint)]">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/prompts/${p._id}`}
                          className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                          title="Manage images"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => { setEditing(p); setModalOpen(true); }}
                          disabled={p.isLocked}
                          className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] disabled:opacity-30"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(p._id)}
                          className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)]"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={p.isLocked}
                          className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] disabled:opacity-30"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PromptFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} editingPrompt={editing} />
    </div>
  );
}
