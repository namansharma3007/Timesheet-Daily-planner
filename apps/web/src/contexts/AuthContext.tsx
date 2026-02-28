import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAuthToken } from '@timesheet/api-client';
import type { User } from '@timesheet/types';
import { queryKeys } from '@timesheet/query-config';

const TOKEN_KEY = 'ts_token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      // Token exists — the meQuery in App will validate it against the server
      setToken(stored);
      setAuthToken(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newUser: User, newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setUser(newUser);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setToken(null);
    // Wipe all cached data on logout
    queryClient.clear();
  }, [queryClient]);

  // Expose logout for 401 handling in http client
  useEffect(() => {
    window.__timesheetLogout = logout;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// Augment window for the global logout reference used by the http client
declare global {
  interface Window {
    __timesheetLogout?: () => void;
  }
}
