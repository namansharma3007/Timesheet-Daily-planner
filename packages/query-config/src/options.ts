import { queryOptions } from '@tanstack/react-query';
import { timesheetApi, authApi } from '@timesheet/api-client';
import { queryKeys } from './keys';

/**
 * Query option factories.
 *
 * Defined here (not inside hooks) so they can be used for:
 *  - prefetching in route loaders
 *  - seeding cache from SSR
 *  - referencing in mutations' onSuccess invalidations
 */

// ── Auth ──────────────────────────────────────────────────────────────────────

export const meQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => authApi.me(signal),
    // Auth check is cheap; keep for 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

// ── Timesheets ────────────────────────────────────────────────────────────────

export const daySheetQueryOptions = (date: string) =>
  queryOptions({
    queryKey: queryKeys.timesheets.day(date),
    queryFn: ({ signal }) => timesheetApi.getDay(date, signal),
    /**
     * Cache for 10 minutes. Once a day's data is loaded it almost never
     * changes from another source, so we keep it fresh without refetching.
     *
     * The mutation hooks manually update the cache on save, so even with a
     * long staleTime the UI is always up to date.
     */
    staleTime: 10 * 60 * 1000,
    /**
     * Keep data in cache for 30 minutes after the component unmounts.
     * Navigating back to the same day will instantly show data without
     * a loading spinner.
     */
    gcTime: 30 * 60 * 1000,
  });
