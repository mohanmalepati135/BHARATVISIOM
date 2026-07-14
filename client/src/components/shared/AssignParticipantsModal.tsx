import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { Participant } from '@/types';

export function AssignParticipantsModal({
  open,
  onClose,
  sessionId,
  onSaved,
  alreadyAssignedIds,
}: {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  onSaved: () => void;
  alreadyAssignedIds: string[];
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (!open) return;
    api.get('/participants', { params: { limit: 200 } }).then((res) => setParticipants(res.data.participants));
    setSelected(alreadyAssignedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/sessions/${sessionId}/assign`, { participantIds: selected });
      notify('Participants assigned.', 'success');
      onSaved();
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to assign participants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign participants">
      <div className="max-h-72 overflow-y-auto rounded-[var(--radius-control)] border border-[var(--color-border)] p-2">
        {participants.length === 0 && <p className="p-2 text-sm text-[var(--color-ink-muted)]">No registered participants yet.</p>}
        {participants.map((p) => (
          <label key={p._id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--color-canvas)]">
            <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)} />
            <span className="text-[var(--color-ink)]">{p.fullName}</span>
            <span className="text-xs text-[var(--color-ink-muted)]">{p.email}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={loading}>
          Save assignment
        </Button>
      </div>
    </Modal>
  );
}
