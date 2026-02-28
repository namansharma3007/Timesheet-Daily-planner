import { useState, useEffect, useRef } from 'react';
import { HOUR_HEIGHT, START_HOUR } from '../constants';

interface NowLineState {
  topPx: number | null;
  ref: React.RefObject<HTMLDivElement | null>;
}

export function useNowLine(): NowLineState {
  const ref = useRef<HTMLDivElement | null>(null);
  const [topPx, setTopPx] = useState<number | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const minutesFromStart = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
      setTopPx((minutesFromStart / 60) * HOUR_HEIGHT);
    };

    calculate();
    const id = setInterval(calculate, 30_000);
    return () => clearInterval(id);
  }, []);

  // Scroll into view once on mount
  useEffect(() => {
    if (ref.current) {
      const timer = setTimeout(
        () => ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
        150,
      );
      return () => clearTimeout(timer);
    }
  }, []);

  return { topPx, ref };
}
