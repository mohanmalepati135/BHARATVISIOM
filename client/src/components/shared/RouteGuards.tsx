import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--color-canvas)]">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
    </div>
  );
}

export function RequireAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export function RequireParticipant() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user || user.role !== 'participant') return <Navigate to="/login" replace />;
  return <Outlet />;
}
