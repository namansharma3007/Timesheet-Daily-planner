import { formatDateLong, formatDateShort, offsetDate, toDateKey, todayKey } from '@timesheet/utils';
import type { User } from '@timesheet/types';
import { useTheme } from '../../contexts/ThemeContext';

interface AppHeaderProps {
  user: User;
  currentDate: Date;
  onNavigate: (days: number) => void;
  onGoToday: () => void;
  onLogout: () => void;
}

export function AppHeader({
  user,
  currentDate,
  onNavigate,
  onGoToday,
  onLogout,
}: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isToday = toDateKey(currentDate) === todayKey();

  return (
    <header className="header">
      {/* Brand */}
      <div className="header__brand">
        <div className="header__logo" aria-hidden="true">⏱</div>
        <span className="header__name">TimeSheet</span>
      </div>

      {/* Date navigation */}
      <div className="header__center">
        <button
          className="dnav-btn"
          onClick={() => onNavigate(-1)}
          aria-label="Previous day"
        >
          ‹
        </button>

        <div className="header__date-box">
          <span className="header__date">
            <span className="header__date-long">{formatDateLong(currentDate)}</span>
            <span className="header__date-short">{formatDateShort(currentDate)}</span>
            {isToday && <span className="today-badge">TODAY</span>}
          </span>
        </div>

        <button
          className="dnav-btn"
          onClick={() => onNavigate(1)}
          aria-label="Next day"
        >
          ›
        </button>

        {!isToday && (
          <button className="today-pill" onClick={onGoToday} aria-label="Go to today">
            ↩ Today
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="header__right">
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="user-chip" aria-label={`Signed in as ${user.name}`}>
          <div className="user-avatar" aria-hidden="true">
            {user.name[0]!.toUpperCase()}
          </div>
          <span className="user-chip__name">{user.name}</span>
        </div>

        <button
          className="btn btn--ghost btn--sm signout-btn"
          onClick={onLogout}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
