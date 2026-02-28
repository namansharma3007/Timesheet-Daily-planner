import { sortByTime, totalMinutes } from '@timesheet/utils';
import type { TimesheetEntry } from '@timesheet/types';
import { EntryRow } from './EntryRow';

interface ListPanelProps {
  entries: TimesheetEntry[];
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (entry: TimesheetEntry) => void;
  onCopyToNext: () => void;
  isCopying: boolean;
}

export function ListPanel({
  entries,
  onEdit,
  onDelete,
  onCopyToNext,
  isCopying,
}: ListPanelProps) {
  const sorted = sortByTime(entries, (e) => e.from);
  const mins = totalMinutes(entries);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const totalDisplay = `${h}h${m ? ` ${m}m` : ''}`;

  return (
    <div className="list-panel">
      {/* Header */}
      <div className="list-panel__header">
        <span className="list-panel__title">All Entries</span>
        <span className="list-panel__count" aria-label={`${entries.length} entries`}>
          {entries.length}
        </span>
      </div>

      {/* Stats */}
      <div className="list-panel__stats">
        <div className="stat-card">
          <div className="stat-card__val mono">{entries.length}</div>
          <div className="stat-card__lbl">Blocks</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__val mono">{mins > 0 ? totalDisplay : '0h'}</div>
          <div className="stat-card__lbl">Logged</div>
        </div>
      </div>

      {/* Copy to next day */}
      <div className="list-panel__actions">
        <button
          className="copy-btn"
          onClick={onCopyToNext}
          disabled={isCopying || entries.length === 0}
          aria-label="Copy all entries to the next day"
        >
          📋{isCopying ? ' Copying…' : ' Copy to Next Day'}
        </button>
      </div>

      {/* Entry list */}
      <div className="list-panel__list" role="list" aria-label="Entries for this day">
        {sorted.length === 0 ? (
          <div className="list-panel__empty" role="listitem">
            <div className="list-panel__empty-icon" aria-hidden="true">
              🗓️
            </div>
            <div className="list-panel__empty-text">
              No entries yet.
              <br />
              Tap the timeline or + to add one.
            </div>
          </div>
        ) : (
          sorted.map((entry) => (
            <div key={entry.id} role="listitem">
              <EntryRow entry={entry} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
