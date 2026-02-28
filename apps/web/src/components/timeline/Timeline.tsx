import { HOUR_HEIGHT, SNAP_MINUTES, START_HOUR, TOTAL_HOURS } from '../../constants';
import { minutesToTime } from '@timesheet/utils';
import type { TimesheetEntry } from '@timesheet/types';
import { EventBlock } from './EventBlock';
import { NowLine } from './NowLine';
import { useNowLine } from '../../hooks/useNowLine';

interface TimelineProps {
  entries: TimesheetEntry[];
  onClickEntry: (entry: TimesheetEntry) => void;
  onClickSlot: (from: string, to: string) => void;
}

export function Timeline({ entries, onClickEntry, onClickSlot }: TimelineProps) {
  const { topPx, ref } = useNowLine();

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const rawMins = (y / HOUR_HEIGHT) * 60 + START_HOUR * 60;
    const snapped = Math.round(rawMins / SNAP_MINUTES) * SNAP_MINUTES;
    const from = minutesToTime(Math.max(0, Math.min(23 * 60, snapped)));
    const to = minutesToTime(Math.min(24 * 60, snapped + 60));
    onClickSlot(from, to);
  };

  return (
    <div className="timeline-wrap">
      <div className="timeline-inner">
        {/* Hour labels gutter */}
        <div className="time-gutter" aria-hidden="true">
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div key={i} className="time-slot">
              {i > 0 && (
                <span className="time-label mono">
                  {`${(START_HOUR + i).toString().padStart(2, '0')}:00`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Grid + events */}
        <div
          className="grid-area"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
        >
          {/* Hour rows */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div key={i} className="grid-row" aria-hidden="true">
              <div className="grid-half" />
              <div className="grid-half" />
            </div>
          ))}

          {/* Click capture layer */}
          <div
            className="grid-click"
            onClick={handleGridClick}
            role="button"
            aria-label="Click to add entry at this time"
          />

          {/* Current time indicator */}
          {topPx !== null && <NowLine topPx={topPx} lineRef={ref} />}

          {/* Entry blocks */}
          {entries.map((entry) => (
            <EventBlock key={entry.id} entry={entry} onClick={onClickEntry} />
          ))}
        </div>
      </div>
    </div>
  );
}
