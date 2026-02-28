import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@timesheet/ui/globals.css';

import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

/**
 * Global QueryClient configuration.
 *
 * Key decisions:
 *  - staleTime: 0 by default (individual queries override as needed)
 *  - retry: 1 — retry once on network errors, but not on 4xx
 *  - refetchOnWindowFocus: true in prod, false in dev to avoid noise
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: (failureCount, error: unknown) => {
        // Don't retry on client errors (4xx)
        if (
          error instanceof Error &&
          'statusCode' in error &&
          typeof (error as { statusCode: unknown }).statusCode === 'number'
        ) {
          const status = (error as { statusCode: number }).statusCode;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      retry: false,
    },
  },
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
);