/**
 * Centralized query key factory.
 *
 * All TanStack Query cache keys live here. This ensures:
 * - No magic strings scattered across the codebase
 * - Easy targeted invalidation (e.g. invalidate all timesheets, or just one day)
 * - Type-safe keys
 */
export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // ── Timesheets ────────────────────────────────────────────────────────────
  timesheets: {
    all: ['timesheets'] as const,
    /** All days for the current user */
    days: () => [...queryKeys.timesheets.all, 'days'] as const,
    /** Single day: e.g. ['timesheets', 'days', '2025-01-15'] */
    day: (date: string) => [...queryKeys.timesheets.days(), date] as const,
  },
} as const;
