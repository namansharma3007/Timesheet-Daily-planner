import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timesheetApi } from '@timesheet/api-client';
import { queryKeys } from '@timesheet/query-config';
import type { GetDaySheetResponse, TimesheetEntry } from '@timesheet/types';
import { genId, offsetDate, toDateKey } from '@timesheet/utils';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

// ─── Upsert (full day replace) ────────────────────────────────────────────────

interface UpsertDayArgs {
  date: string;
  entries: TimesheetEntry[];
}

export function useUpsertDay() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ date, entries }: UpsertDayArgs) =>
      timesheetApi.upsertDay(date, { entries }),

    /**
     * Optimistic update: immediately write the new entries into the cache
     * before the network request completes, so the UI feels instant.
     */
    onMutate: async ({ date, entries }) => {
      // Cancel any in-flight refetch for this day to avoid overwriting optimistic data
      await queryClient.cancelQueries({ queryKey: queryKeys.timesheets.day(date) });

      // Snapshot current cache value so we can roll back on error
      const previous = queryClient.getQueryData<GetDaySheetResponse>(
        queryKeys.timesheets.day(date),
      );

      // Write optimistic data
      queryClient.setQueryData<GetDaySheetResponse>(queryKeys.timesheets.day(date), (old) => ({
        sheet: {
          userId: old?.sheet?.userId ?? '',
          date,
          entries,
          updatedAt: new Date().toISOString(),
        },
      }));

      return { previous, date };
    },

    onError: (_err, _vars, context) => {
      // Roll back to snapshot
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.timesheets.day(context.date), context.previous);
      }
      addToast('Failed to save changes', 'error');
    },

    onSuccess: ({ sheet }, { date }) => {
      // Settle cache with authoritative server response
      queryClient.setQueryData<GetDaySheetResponse>(queryKeys.timesheets.day(date), { sheet });
    },
  });
}

// ─── Save single entry (add or update) ────────────────────────────────────────

interface SaveEntryArgs {
  date: string;
  entry: TimesheetEntry;
  currentEntries: TimesheetEntry[];
}

export function useSaveEntry() {
  const upsertDay = useUpsertDay();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ date, entry, currentEntries }: SaveEntryArgs) => {
      const exists = currentEntries.some((e) => e.id === entry.id);
      const next = exists
        ? currentEntries.map((e) => (e.id === entry.id ? entry : e))
        : [...currentEntries, entry];
      return upsertDay.mutateAsync({ date, entries: next });
    },
    onSuccess: (_data, { currentEntries, entry }) => {
      const exists = currentEntries.some((e) => e.id === entry.id);
      addToast(exists ? 'Entry updated' : 'Entry added');
    },
    onError: () => {
      // upsertDay already toasts on error
    },
  });
}

// ─── Delete single entry ───────────────────────────────────────────────────────

interface DeleteEntryArgs {
  date: string;
  entryId: string;
  currentEntries: TimesheetEntry[];
}

export function useDeleteEntry() {
  const upsertDay = useUpsertDay();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ date, entryId, currentEntries }: DeleteEntryArgs) => {
      const next = currentEntries.filter((e) => e.id !== entryId);
      return upsertDay.mutateAsync({ date, entries: next });
    },
    onSuccess: () => {
      addToast('Entry deleted');
    },
  });
}

// ─── Copy to next day ──────────────────────────────────────────────────────────

export function useCopyToNextDay() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (date: string) => timesheetApi.copyToNextDay(date),

    onSuccess: ({ sheet }) => {
      // Seed the next day's cache immediately — no refetch needed
      queryClient.setQueryData<GetDaySheetResponse>(
        queryKeys.timesheets.day(sheet.date),
        { sheet },
      );
      const nextDate = toDateKey(offsetDate(new Date(sheet.date), 0));
      addToast(`${sheet.entries.length} entries copied to ${nextDate}`);
    },

    onError: () => {
      addToast('Failed to copy entries', 'error');
    },
  });
}

// ─── Prefetch adjacent days ────────────────────────────────────────────────────
// Call this to warm the cache for prev/next day navigation

export function usePrefetchDay() {
  const queryClient = useQueryClient();

  return (date: string) => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.timesheets.day(date),
      queryFn: ({ signal }) => timesheetApi.getDay(date, signal),
      staleTime: 10 * 60 * 1000,
    });
  };
}
