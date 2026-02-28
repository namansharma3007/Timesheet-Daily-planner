import type { TimesheetEntry } from '@timesheet/types';

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** "HH:MM" → total minutes from midnight */
export function timeToMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Total minutes → "HH:MM" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** "HH:MM" → "h:mm AM/PM" */
export function formatTime12(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/** Duration between two "HH:MM" strings → human string like "1h 30m" */
export function formatDuration(from: string, to: string): string {
  const d = timeToMinutes(to) - timeToMinutes(from);
  if (d <= 0) return '0m';
  return d < 60 ? `${d}m` : `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ''}`;
}

/** Total logged minutes for a list of entries */
export function totalMinutes(entries: TimesheetEntry[]): number {
  return entries.reduce((acc, e) => acc + (timeToMinutes(e.to) - timeToMinutes(e.from)), 0);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Date → "YYYY-MM-DD" */
export function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/** Today as "YYYY-MM-DD" */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Full display: "Monday, Jan 15, 2025" */
export function formatDateLong(date: Date): string {
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Short display: "Jan 15" */
export function formatDateShort(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Offset a date by N days, returns new Date */
export function offsetDate(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── DOM / CSS helpers ────────────────────────────────────────────────────────

/** Hex color "#RRGGBB" → "R,G,B" for use in rgba() */
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Cryptographically-weak but fast short ID, sufficient for UI keys */
export function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Type-safe array sort by a numeric key */
export function sortByTime<T>(items: T[], getter: (item: T) => string): T[] {
  return [...items].sort((a, b) => timeToMinutes(getter(a)) - timeToMinutes(getter(b)));
}
