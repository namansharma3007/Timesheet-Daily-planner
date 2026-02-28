import type { Toast as ToastType } from '@timesheet/types';

interface ToastListProps {
  toasts: ToastType[];
}

export function ToastList({ toasts }: ToastListProps) {
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span aria-hidden="true">{t.type === 'success' ? '✓' : '✕'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
