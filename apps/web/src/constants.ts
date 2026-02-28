export const HOUR_HEIGHT = 64; // px per hour on the timeline grid
export const START_HOUR = 0;
export const END_HOUR = 24;
export const TOTAL_HOURS = END_HOUR - START_HOUR;
export const SNAP_MINUTES = 15; // click-to-add snaps to 15-min intervals

export const COLORS = [
  { bg: '#6366f1', label: 'Indigo' },
  { bg: '#10b981', label: 'Emerald' },
  { bg: '#f59e0b', label: 'Amber' },
  { bg: '#ef4444', label: 'Red' },
  { bg: '#8b5cf6', label: 'Violet' },
  { bg: '#ec4899', label: 'Pink' },
  { bg: '#14b8a6', label: 'Teal' },
  { bg: '#f97316', label: 'Orange' },
  { bg: '#3b82f6', label: 'Blue' },
  { bg: '#84cc16', label: 'Lime' },
] as const;
