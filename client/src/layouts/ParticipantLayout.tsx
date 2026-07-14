import { Outlet, Link } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export function ParticipantLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/participant" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] font-display text-xs font-bold text-white">
              BV
            </div>
            <span className="font-display text-sm font-semibold text-[var(--color-ink)]">BharatVision</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)]">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <span className="text-sm text-[var(--color-ink-muted)]">{user?.name}</span>
            <button onClick={() => logout()} className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
