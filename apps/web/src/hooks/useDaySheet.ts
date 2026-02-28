import { useQuery } from '@tanstack/react-query';
import { daySheetQueryOptions } from '@timesheet/query-config';
import type { TimesheetEntry } from '@timesheet/types';

/**
 * Fetches the entry list for a given date.
 *
 * Cache behaviour:
 *  - staleTime: 10 min  → won't refetch if data was fetched within 10 min
 *  - gcTime:    30 min  → cached data survives unmount for 30 min
 *
 * This means navigating back to a previously-viewed date renders instantly
 * with no network request, until 10 minutes have elapsed.
 */
export function useDaySheet(date: string) {
  const query = useQuery(daySheetQueryOptions(date));

  const entries: TimesheetEntry[] = query.data?.sheet?.entries ?? [];

  return {
    entries,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}
