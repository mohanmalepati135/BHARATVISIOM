import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from './AuthShell';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ParticipantRegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', state: '', occupation: '', age: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setSession } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/participant/register', {
        ...form,
        age: form.age ? Number(form.age) : undefined,
      });
      setSession(res.data.token, res.data.user);
      notify('Account created. Let\u2019s get you set up.', 'success');
      navigate('/participant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register to take part in cultural evaluation studies."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-[var(--color-accent)]">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" minLength={8} required value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min={13} value={form.age} onChange={(e) => update('age', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" value={form.state} onChange={(e) => update('state', e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="occupation">Occupation</Label>
          <Input id="occupation" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} />
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
