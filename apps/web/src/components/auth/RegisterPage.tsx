import { useState, type FormEvent } from 'react';
import { Spinner } from '@timesheet/ui';
import { useRegister } from '../../hooks/useAuthMutations';
import { useTheme } from '../../contexts/ThemeContext';

interface RegisterPageProps {
  onSwitch: () => void;
}

export function RegisterPage({ onSwitch }: RegisterPageProps) {
  const { theme, toggleTheme } = useTheme();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setFieldError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setFieldError('Password must be at least 6 characters.');
      return;
    }
    setFieldError('');
    register.mutate({ name: name.trim(), email: email.toLowerCase().trim(), password });
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
        <h1 className="login-card__title">Create account</h1>
        <p className="login-card__sub">Start tracking your time</p>

        {(fieldError || register.error) && (
          <div className="err-msg" role="alert">
            {fieldError || register.error?.message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="field__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="field__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
          </div>
          <button
            className="btn btn--primary btn--full"
            type="submit"
            disabled={register.isPending}
            style={{ marginTop: 4 }}
          >
            {register.isPending ? <Spinner /> : 'Create Account'}
          </button>
        </form>

        <div className="login-card__footer">
          Already have an account?{' '}
          <button type="button" onClick={onSwitch}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
