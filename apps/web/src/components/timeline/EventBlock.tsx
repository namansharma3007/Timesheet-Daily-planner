import { COLORS, HOUR_HEIGHT, START_HOUR } from '../../constants';
import { formatTime12, hexToRgb, timeToMinutes } from '@timesheet/utils';
import type { TimesheetEntry } from '@timesheet/types';

interface EventBlockProps {
  entry: TimesheetEntry;
  onClick: (entry: TimesheetEntry) => void;
}

export function EventBlock({ entry, onClick }: EventBlockProps) {
  const color = COLORS[entry.color]?.bg ?? COLORS[0]!.bg;
  const topPx = ((timeToMinutes(entry.from) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const heightPx = Math.max(
    ((timeToMinutes(entry.to) - timeToMinutes(entry.from)) / 60) * HOUR_HEIGHT,
    24,
  );
  const rgb = hexToRgb(color);

  return (
    <div
      className="ev-block"
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        background: `rgba(${rgb}, var(--block-opacity))`,
        borderLeftColor: color,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(entry);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${entry.title}, ${formatTime12(entry.from)} to ${formatTime12(entry.to)}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(entry)}
    >
      <div className="ev-block__title" style={{ color }}>
        {entry.title}
      </div>
      {heightPx >= 38 && (
        <div className="ev-block__time" style={{ color }}>
          {formatTime12(entry.from)} – {formatTime12(entry.to)}
        </div>
      )}
      {heightPx >= 54 && entry.notes && (
        <div className="ev-block__notes">{entry.notes}</div>
      )}
    </div>
  );
}
