import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@timesheet/ui';
import { meQueryOptions } from '@timesheet/query-config';
import { configureApiClient } from '@timesheet/api-client';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

type AuthMode = 'login' | 'register';

// Configure API client to redirect to login on 401
configureApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  onUnauthorized: () => {
    window.__timesheetLogout?.();
  },
});

/**
 * Session bootstrap:
 * If a token exists in localStorage (set by AuthContext), verify it with the
 * server's /me endpoint. On success we update the user in context. On failure
 * (token expired, revoked, etc.) we clear the token and show login.
 */
function useSessionBootstrap() {
  const { token, login, logout, isLoading: authLoading } = useAuth();

  const meQuery = useQuery({
    ...meQueryOptions(),
    // Only run if we have a token to validate
    enabled: !authLoading && !!token,
  });

  // Hydrate user in context from server response
  useEffect(() => {
    if (meQuery.data) {
      login(meQuery.data.user, meQuery.data.token);
    }
  }, [meQuery.data, login]);

  // Token was rejected — clear session
  useEffect(() => {
    if (meQuery.isError) {
      logout();
    }
  }, [meQuery.isError, logout]);

  const isBootstrapping = authLoading || (!!token && meQuery.isLoading);

  return { isBootstrapping };
}

export function App() {
  const { user } = useAuth();
  const { isBootstrapping } = useSessionBootstrap();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  if (isBootstrapping) {
    return (
      <div className="page-loader">
        <Spinner large />
        <div className="page-loader__text">Loading TimeSheet…</div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onSwitch={() => setAuthMode('register')} />
    ) : (
      <RegisterPage onSwitch={() => setAuthMode('login')} />
    );
  }

  return <DashboardPage />;
}
