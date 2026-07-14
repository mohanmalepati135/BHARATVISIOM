import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Card, Input, Label, Textarea } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ConsentPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    age: '',
    state: '',
    occupation: '',
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.consent) {
      setError('Please check the consent box to continue.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/evaluation/consent', {
        fullName: form.fullName,
        email: form.email,
        age: form.age ? Number(form.age) : undefined,
        state: form.state,
        occupation: form.occupation,
        consentGiven: true,
      });
      notify('Thanks — you\u2019re all set.', 'success');
      navigate('/participant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">Participant consent</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          A few details before your first evaluation. This information is used for research purposes only.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min={13} value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input id="occupation" value={form.occupation} onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))} />
          </div>
          <label className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.consent}
              onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            />
            <span>
              I consent to participate in this research study and understand my anonymized responses may be used
              for AI model evaluation research by Josh Talks AI.
            </span>
          </label>
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}
