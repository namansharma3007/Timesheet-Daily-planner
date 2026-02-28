import { useState, useCallback } from 'react';
import { ToastList } from '@timesheet/ui';
import { offsetDate, toDateKey, todayKey } from '@timesheet/utils';
import type { MobileTab, TimesheetEntry } from '@timesheet/types';

import { AppHeader } from '../components/layout/AppHeader';
import { TabBar } from '../components/layout/TabBar';
import { TimelinePanel } from '../components/timeline/TimelinePanel';
import { ListPanel } from '../components/entries/ListPanel';
import { EntryModal } from '../components/modals/EntryModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDaySheet } from '../hooks/useDaySheet';
import {
  useSaveEntry,
  useDeleteEntry,
  useCopyToNextDay,
  usePrefetchDay,
} from '../hooks/useTimesheetMutations';

/**
 * entryModal state machine:
 *   false                  → modal closed
 *   null                   → open for new entry (no pre-fill)
 *   Partial<TimesheetEntry> → open for new entry with pre-filled from/to
 *   TimesheetEntry          → open for editing existing entry
 */
type EntryModalState = false | null | Partial<TimesheetEntry>;

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { toasts } = useToast();

  // ── Date state ─────────────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const dateStr = toDateKey(currentDate);
  const isToday = dateStr === todayKey();

  // ── Modal state ────────────────────────────────────────────────────────────
  const [entryModal, setEntryModal] = useState<EntryModalState>(false);
  const [confirmEntry, setConfirmEntry] = useState<TimesheetEntry | null>(null);

  // ── Mobile tab state ───────────────────────────────────────────────────────
  const [mobileTab, setMobileTab] = useState<MobileTab>('timeline');

  // ── Data ───────────────────────────────────────────────────────────────────
  const { entries, isLoading, isFetching } = useDaySheet(dateStr);
  const saveEntry = useSaveEntry();
  const deleteEntry = useDeleteEntry();
  const copyToNext = useCopyToNextDay();
  const prefetchDay = usePrefetchDay();

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigate = useCallback(
    (days: number) => {
      const next = offsetDate(currentDate, days);
      setCurrentDate(next);
      // Eagerly prefetch the day after that too
      prefetchDay(toDateKey(offsetDate(next, days)));
    },
    [currentDate, prefetchDay],
  );

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  // ── Entry save ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (entry: TimesheetEntry) => {
      await saveEntry.mutateAsync({ date: dateStr, entry, currentEntries: entries });
      setEntryModal(false);
    },
    [dateStr, entries, saveEntry],
  );

  // ── Entry delete ───────────────────────────────────────────────────────────
  const handleConfirmDelete = useCallback(async () => {
    if (!confirmEntry) return;
    await deleteEntry.mutateAsync({
      date: dateStr,
      entryId: confirmEntry.id,
      currentEntries: entries,
    });
    setConfirmEntry(null);
  }, [confirmEntry, dateStr, entries, deleteEntry]);

  // ── Copy to next day ───────────────────────────────────────────────────────
  const handleCopyToNext = useCallback(() => {
    copyToNext.mutate(dateStr);
  }, [copyToNext, dateStr]);

  if (!user) return null;

  return (
    <div className="app">
      <AppHeader
        user={user}
        currentDate={currentDate}
        onNavigate={navigate}
        onGoToday={goToday}
        onLogout={logout}
      />

      <div className="main">
        {/* Timeline panel — always rendered on desktop, shown by tab on mobile */}
        <div
          className={`mobile-panel${mobileTab === 'timeline' ? ' mobile-panel--active' : ''}`}
          style={{ flex: 1, minWidth: 0 }}
        >
          <TimelinePanel
            isToday={isToday}
            isLoading={isLoading}
            isFetching={isFetching}
            entries={entries}
            onAddEntry={() => setEntryModal(null)}
            onEditEntry={(e) => setEntryModal(e)}
            onClickSlot={(from, to) => setEntryModal({ from, to })}
          />
        </div>

        {/* Entries list panel */}
        <div
          className={`mobile-panel${mobileTab === 'entries' ? ' mobile-panel--active' : ''}`}
        >
          <ListPanel
            entries={entries}
            onEdit={(e) => setEntryModal(e)}
            onDelete={(e) => setConfirmEntry(e)}
            onCopyToNext={handleCopyToNext}
            isCopying={copyToNext.isPending}
          />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <TabBar
        activeTab={mobileTab}
        onChangeTab={setMobileTab}
        onAdd={() => setEntryModal(null)}
      />

      {/* Modals */}
      {entryModal !== false && (
        <EntryModal
          entry={entryModal}
          onSave={handleSave}
          onClose={() => setEntryModal(false)}
        />
      )}
      {confirmEntry && (
        <ConfirmModal
          entry={confirmEntry}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmEntry(null)}
        />
      )}

      <ToastList toasts={toasts} />
    </div>
  );
}
