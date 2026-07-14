import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, UserPlus, Rocket, Lock as LockIcon, Trash2, Pencil, BarChart2 } from 'lucide-react';
import { PageHeader, EmptyState, Skeleton } from '@/components/shared/PageParts';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/primitives';
import { SessionFormModal } from '@/components/shared/SessionFormModal';
import { AssignParticipantsModal } from '@/components/shared/AssignParticipantsModal';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { EvaluationSession, SessionStatus } from '@/types';
import { ClipboardList } from 'lucide-react';

const STATUS_TONE: Record<SessionStatus, 'default' | 'accent' | 'success'> = {
  draft: 'default',
  published: 'accent',
  closed: 'success',
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<EvaluationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EvaluationSession | null>(null);
  const [assigningSession, setAssigningSession] = useState<EvaluationSession | null>(null);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get('/sessions')
      .then((res) => setSessions(res.data.sessions))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePublish = async (id: string) => {
    if (!confirm('Publishing locks all prompts and images in this session. Continue?')) return;
    try {
      await api.patch(`/sessions/${id}/publish`);
      notify('Session published and locked.', 'success');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to publish session.', 'error');
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Close this session? Participants will no longer be able to submit responses.')) return;
    try {
      await api.patch(`/sessions/${id}/close`);
      notify('Session closed.', 'success');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to close session.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft session?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      notify('Session deleted.', 'success');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete session.', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Evaluation sessions"
        description="Group prompts into evaluation cycles and assign participants."
        actions={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Create session
          </Button>
        }
      />
      <div className="p-8 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No evaluation sessions yet"
            description="Create a session, attach prompts, and assign participants to begin collecting evaluations."
            action={<Button onClick={() => setModalOpen(true)}>Create session</Button>}
          />
        ) : (
          sessions.map((s) => {
            const promptCount = Array.isArray(s.prompts) ? s.prompts.length : 0;
            const participantCount = Array.isArray(s.assignedParticipants) ? s.assignedParticipants.length : 0;
            const assignedIds = (s.assignedParticipants as { _id: string }[]).map((p) => (typeof p === 'string' ? p : p._id));
            return (
              <Card key={s._id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">{s.name}</h3>
                      <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{s.description || s.category}</p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--color-ink-muted)]">
                      <span>{promptCount} prompts</span>
                      <span>{participantCount} participants assigned</span>
                      <span>{s.responseCount ?? 0} responses submitted</span>
                      {s.startDate && <span>Starts {new Date(s.startDate).toLocaleDateString()}</span>}
                      {s.endDate && <span>Ends {new Date(s.endDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.status !== 'closed' && (
                      <Button variant="outline" size="sm" onClick={() => setAssigningSession(s)}>
                        <UserPlus className="h-3.5 w-3.5" /> Assign
                      </Button>
                    )}
                    {s.status === 'draft' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => { setEditing(s); setModalOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button size="sm" onClick={() => handlePublish(s._id)}>
                          <Rocket className="h-3.5 w-3.5" /> Publish
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {s.status === 'published' && (
                      <Button variant="secondary" size="sm" onClick={() => handleClose(s._id)}>
                        <LockIcon className="h-3.5 w-3.5" /> Close session
                      </Button>
                    )}
                    <Link to={`/admin/results?session=${s._id}`}>
                      <Button variant="ghost" size="sm">
                        <BarChart2 className="h-3.5 w-3.5" /> Results
                      </Button>
                    </Link>
                  </div>
                </div>

                {assigningSession?._id === s._id && (
                  <AssignParticipantsModal
                    open
                    onClose={() => setAssigningSession(null)}
                    sessionId={s._id}
                    onSaved={load}
                    alreadyAssignedIds={assignedIds}
                  />
                )}
              </Card>
            );
          })
        )}
      </div>

      <SessionFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} editingSession={editing} />
    </div>
  );
}
