import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { RequireAdmin, RequireParticipant } from '@/components/shared/RouteGuards';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ParticipantLayout } from '@/layouts/ParticipantLayout';

import LandingPage from '@/pages/LandingPage';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import ParticipantLoginPage from '@/pages/auth/ParticipantLoginPage';
import ParticipantRegisterPage from '@/pages/auth/ParticipantRegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

import DashboardPage from '@/pages/admin/DashboardPage';
import SessionsPage from '@/pages/admin/SessionsPage';
import PromptsPage from '@/pages/admin/PromptsPage';
import PromptDetailPage from '@/pages/admin/PromptDetailPage';
import ParticipantsPage from '@/pages/admin/ParticipantsPage';
import ResultsPage from '@/pages/admin/ResultsPage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import LeaderboardPage from '@/pages/admin/LeaderboardPage';
import SettingsPage from '@/pages/admin/SettingsPage';

import ParticipantHomePage from '@/pages/participant/ParticipantHomePage';
import ConsentPage from '@/pages/participant/ConsentPage';
import EvaluationPage from '@/pages/participant/EvaluationPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/login" element={<ParticipantLoginPage />} />
                <Route path="/register" element={<ParticipantRegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Admin */}
                <Route element={<RequireAdmin />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<DashboardPage />} />
                    <Route path="/admin/sessions" element={<SessionsPage />} />
                    <Route path="/admin/prompts" element={<PromptsPage />} />
                    <Route path="/admin/prompts/:id" element={<PromptDetailPage />} />
                    <Route path="/admin/participants" element={<ParticipantsPage />} />
                    <Route path="/admin/results" element={<ResultsPage />} />
                    <Route path="/admin/analytics" element={<AnalyticsPage />} />
                    <Route path="/admin/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Participant */}
                <Route element={<RequireParticipant />}>
                  <Route element={<ParticipantLayout />}>
                    <Route path="/participant" element={<ParticipantHomePage />} />
                    <Route path="/participant/consent" element={<ConsentPage />} />
                    <Route path="/participant/evaluate/:sessionId" element={<EvaluationPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
