import { Spinner } from '@timesheet/ui';
import type { TimesheetEntry } from '@timesheet/types';
import { Timeline } from '../timeline/Timeline';

interface TimelinePanelProps {
  isToday: boolean;
  isLoading: boolean;
  isFetching: boolean;
  entries: TimesheetEntry[];
  onAddEntry: () => void;
  onEditEntry: (entry: TimesheetEntry) => void;
  onClickSlot: (from: string, to: string) => void;
}

export function TimelinePanel({
  isToday,
  isLoading,
  isFetching,
  entries,
  onAddEntry,
  onEditEntry,
  onClickSlot,
}: TimelinePanelProps) {
  return (
    <div className="tl-panel">
      <div className="tl-panel__header">
        <div className="tl-panel__title">
          {isToday ? "Today's Schedule" : 'Schedule'}
          {isToday && <span className="live-badge" aria-label="Live">● LIVE</span>}
          {isFetching && !isLoading && (
            <span style={{ marginLeft: 6, opacity: 0.5 }}>
              <Spinner />
            </span>
          )}
        </div>
        <button
          className="btn btn--primary btn--sm add-entry-desktop"
          onClick={onAddEntry}
          aria-label="Add new entry"
        >
          + Add Entry
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spinner large />
        </div>
      ) : (
        <div className="fade-in">
          {entries.length === 0 && (
            <div className="empty-state" style={{ marginBottom: 16 }}>
              <div className="empty-state__icon" aria-hidden="true">🗓️</div>
              <div className="empty-state__title">No entries for this day</div>
              <div className="empty-state__sub">
                Tap + or click the timeline to add an entry.
              </div>
            </div>
          )}
          <Timeline
            entries={entries}
            onClickEntry={onEditEntry}
            onClickSlot={onClickSlot}
          />
        </div>
      )}
    </div>
  );
}
