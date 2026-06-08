import { useEffect, useRef, useState } from 'react';
import { appendSparklinePoint, seedSparklineFromMetric } from '@/lib/perceivedRealtime';
import { PERCEIVED_METRICS_TICK_MS } from '@/lib/telemetryLivePerception';

/** Streams sparkline tail with micro-fluctuations between backend refreshes. */
export function usePerceivedSparkline(
  metricValue: number,
  streaming: boolean,
  smooth = true,
  seed?: number[],
) {
  const [trend, setTrend] = useState<number[]>(() =>
    seed && seed.length > 0 ? seed : seedSparklineFromMetric(metricValue),
  );
  const valueRef = useRef(metricValue);

  useEffect(() => {
    valueRef.current = metricValue;
  }, [metricValue]);

  useEffect(() => {
    if (seed && seed.length > 0) {
      setTrend(seed);
    }
  }, [seed?.join('|')]);

  useEffect(() => {
    if (!streaming || !smooth || metricValue <= 0) return;

    const tick = () => {
      const next = appendSparklinePoint([], valueRef.current, 1)[0] ?? valueRef.current;
      setTrend((prev) => appendSparklinePoint(prev, next));
    };

    tick();
    const id = setInterval(tick, PERCEIVED_METRICS_TICK_MS);
    return () => clearInterval(id);
  }, [streaming, smooth, metricValue]);

  return trend;
}
