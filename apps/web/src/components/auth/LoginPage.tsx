import { useState, type FormEvent } from 'react';
import { Spinner } from '@timesheet/ui';
import { useLogin } from '../../hooks/useAuthMutations';
import { useTheme } from '../../contexts/ThemeContext';

interface LoginPageProps {
  onSwitch: () => void;
}

export function LoginPage({ onSwitch }: LoginPageProps) {
  const { theme, toggleTheme } = useTheme();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFieldError('Please fill in all fields.');
      return;
    }
    setFieldError('');
    login.mutate({ email: email.toLowerCase().trim(), password });
  };

  return (
    <div className="login-wrap">
      <button className="login-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="login-card">
        <div className="login-card__brand">
          <div className="login-card__brand-icon">⏱</div>
          <span className="login-card__brand-name">TimeSheet</span>
        </div>
        <h1 className="login-card__title">Welcome back</h1>
        <p className="login-card__sub">Sign in to your workspace</p>

        {(fieldError || login.error) && (
          <div className="err-msg" role="alert">
            {fieldError || login.error?.message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="field__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            className="btn btn--primary btn--full"
            type="submit"
            disabled={login.isPending}
            style={{ marginTop: 4 }}
          >
            {login.isPending ? <Spinner /> : 'Sign In'}
          </button>
        </form>

        <div className="login-card__footer">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitch}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}
