import { useMutation } from '@tanstack/react-query';
import { authApi } from '@timesheet/api-client';
import type { LoginRequest, RegisterRequest } from '@timesheet/types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useLogin() {
  const { login } = useAuth();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ user, token }) => {
      login(user, token);
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });
}

export function useRegister() {
  const { login } = useAuth();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: ({ user, token }) => {
      // The API seeds demo entries for today server-side during registration.
      // The dashboard's useDaySheet query will fetch them automatically on mount.
      login(user, token);
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });
}
