import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  ImagePlus,
  Users,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
  Sun,
  Moon,
  ListChecks,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/sessions', label: 'Evaluation sessions', icon: ClipboardList },
  { to: '/admin/prompts', label: 'Prompt management', icon: FileText },
  { to: '/admin/prompts?tab=upload', label: 'Image upload', icon: ImagePlus },
  { to: '/admin/participants', label: 'Participants', icon: Users },
  { to: '/admin/results', label: 'Evaluation results', icon: ListChecks },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)]">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] font-display text-sm font-bold text-white">
            BV
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-none text-[var(--color-ink)]">BharatVision</p>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">Research console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="mt-2 flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent)]">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-ink)]">{user?.name}</p>
              <p className="truncate text-xs text-[var(--color-ink-muted)]">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
