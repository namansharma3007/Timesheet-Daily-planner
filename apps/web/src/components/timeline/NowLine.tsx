import { type RefObject } from 'react';

interface NowLineProps {
  topPx: number;
  lineRef: RefObject<HTMLDivElement | null>;
}

export function NowLine({ topPx, lineRef }: NowLineProps) {
  return (
    <div
      ref={lineRef}
      className="now-line"
      style={{ top: `${topPx}px` }}
      aria-hidden="true"
    >
      <div className="now-line__dot" />
      <div className="now-line__bar" />
    </div>
  );
}
