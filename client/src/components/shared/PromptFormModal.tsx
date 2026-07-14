import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { Prompt } from '@/types';

const EMPTY = {
  festivalName: '',
  state: '',
  category: '',
  promptTitle: '',
  promptDescription: '',
  fullPrompt: '',
  expectedCulturalElements: '',
  commonFailureCases: '',
};

export function PromptFormModal({
  open,
  onClose,
  onSaved,
  editingPrompt,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingPrompt: Prompt | null;
}) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (editingPrompt) {
      setForm({
        festivalName: editingPrompt.festivalName,
        state: editingPrompt.state,
        category: editingPrompt.category,
        promptTitle: editingPrompt.promptTitle,
        promptDescription: editingPrompt.promptDescription,
        fullPrompt: editingPrompt.fullPrompt,
        expectedCulturalElements: editingPrompt.expectedCulturalElements || '',
        commonFailureCases: editingPrompt.commonFailureCases || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [editingPrompt, open]);

  const update = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPrompt) {
        await api.patch(`/prompts/${editingPrompt._id}`, form);
        notify('Prompt updated.', 'success');
      } else {
        await api.post('/prompts', form);
        notify('Prompt created.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save prompt.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editingPrompt ? 'Edit prompt' : 'Create prompt'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="festivalName">Festival name</Label>
            <Input id="festivalName" required value={form.festivalName} onChange={(e) => update('festivalName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" required value={form.state} onChange={(e) => update('state', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" required value={form.category} onChange={(e) => update('category', e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="promptTitle">Prompt title</Label>
          <Input id="promptTitle" required value={form.promptTitle} onChange={(e) => update('promptTitle', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="promptDescription">Prompt description</Label>
          <Textarea id="promptDescription" required rows={2} value={form.promptDescription} onChange={(e) => update('promptDescription', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="fullPrompt">Full prompt</Label>
          <Textarea id="fullPrompt" required rows={4} value={form.fullPrompt} onChange={(e) => update('fullPrompt', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="expectedCulturalElements">Expected cultural elements (admin only)</Label>
          <Textarea id="expectedCulturalElements" rows={2} value={form.expectedCulturalElements} onChange={(e) => update('expectedCulturalElements', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="commonFailureCases">Common failure cases (admin only)</Label>
          <Textarea id="commonFailureCases" rows={2} value={form.commonFailureCases} onChange={(e) => update('commonFailureCases', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {editingPrompt ? 'Save changes' : 'Create prompt'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
