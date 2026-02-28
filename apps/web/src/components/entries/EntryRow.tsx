import { COLORS } from '../../constants';
import { formatDuration, formatTime12 } from '@timesheet/utils';
import type { TimesheetEntry } from '@timesheet/types';

interface EntryRowProps {
  entry: TimesheetEntry;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (entry: TimesheetEntry) => void;
}

export function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
  const color = COLORS[entry.color]?.bg ?? COLORS[0]!.bg;

  return (
    <div className="entry-row">
      <div className="entry-row__color-bar" style={{ background: color }} aria-hidden="true" />

      <div className="entry-row__body">
        <div className="entry-row__title" title={entry.title}>
          {entry.title}
        </div>
        <div className="entry-row__meta">
          <span className="entry-row__time mono">
            {formatTime12(entry.from)} – {formatTime12(entry.to)}
          </span>
          <span className="entry-row__dur">{formatDuration(entry.from, entry.to)}</span>
        </div>
        {entry.notes && (
          <div className="entry-row__notes" title={entry.notes}>
            {entry.notes}
          </div>
        )}
      </div>

      <div className="entry-row__actions" aria-label="Entry actions">
        <button
          className="entry-action-btn"
          onClick={() => onEdit(entry)}
          aria-label={`Edit ${entry.title}`}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="entry-action-btn entry-action-btn--delete"
          onClick={() => onDelete(entry)}
          aria-label={`Delete ${entry.title}`}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
