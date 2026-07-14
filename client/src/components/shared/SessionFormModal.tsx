import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { EvaluationSession, Prompt } from '@/types';

export function SessionFormModal({
  open,
  onClose,
  onSaved,
  editingSession,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingSession: EvaluationSession | null;
}) {
  const [form, setForm] = useState({ name: '', category: '', description: '', startDate: '', endDate: '' });
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (!open) return;
    api.get('/prompts', { params: { limit: 100 } }).then((res) => setAllPrompts(res.data.prompts));
    if (editingSession) {
      setForm({
        name: editingSession.name,
        category: editingSession.category,
        description: editingSession.description || '',
        startDate: editingSession.startDate?.slice(0, 10) || '',
        endDate: editingSession.endDate?.slice(0, 10) || '',
      });
      setSelectedPrompts((editingSession.prompts as Prompt[]).map((p) => (typeof p === 'string' ? p : p._id)));
    } else {
      setForm({ name: '', category: '', description: '', startDate: '', endDate: '' });
      setSelectedPrompts([]);
    }
  }, [editingSession, open]);

  const togglePrompt = (id: string) =>
    setSelectedPrompts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, prompts: selectedPrompts };
      if (editingSession) {
        await api.patch(`/sessions/${editingSession._id}`, payload);
        notify('Session updated.', 'success');
      } else {
        await api.post('/sessions', payload);
        notify('Session created.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editingSession ? 'Edit session' : 'Create evaluation session'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name">Evaluation name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div>
          <Label>Prompts included ({selectedPrompts.length} selected)</Label>
          <div className="max-h-48 overflow-y-auto rounded-[var(--radius-control)] border border-[var(--color-border)] p-2">
            {allPrompts.length === 0 && <p className="p-2 text-sm text-[var(--color-ink-muted)]">No prompts available yet.</p>}
            {allPrompts.map((p) => (
              <label key={p._id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--color-canvas)]">
                <input type="checkbox" checked={selectedPrompts.includes(p._id)} onChange={() => togglePrompt(p._id)} />
                <span className="text-[var(--color-ink)]">{p.promptTitle}</span>
                <span className="text-xs text-[var(--color-ink-muted)]">({p.imageCount ?? 0}/3 images)</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {editingSession ? 'Save changes' : 'Create session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
