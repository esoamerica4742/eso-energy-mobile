import { useEffect, useRef, useState } from 'react';
import type { TelemetryData } from '@/types/telemetry';
import { cloneTelemetry } from '@/data/mockTelemetry';
import {
  formatLiveStreamMeta,
  FRONTEND_STREAM_TICK_MS,
  perceivedChartValue,
  perceivedLegendValue,
} from '@/lib/telemetryLivePerception';

const MAX_POINTS = 76;

function telemetrySignature(data: TelemetryData): string {
  return [
    data.readingCount,
    data.yMax,
    data.anchorUpdatedAt ?? '',
    data.isLive,
    ...data.series.flatMap((series) => [
      series.id,
      series.currentValue,
      series.data.length,
      series.data.at(-1)?.timestamp ?? 0,
    ]),
  ].join('|');
}

function appendStreamPoint(data: TelemetryData, now: number): TelemetryData {
  const nextSeries = data.series.map((series) => {
    const lastChartValue = series.data[series.data.length - 1]?.value ?? perceivedChartValue(series.id, series.currentValue);
    const chartValue = perceivedChartValue(series.id, series.currentValue);
    const nextChartValue = Number(((lastChartValue + chartValue) / 2).toFixed(4));
    const currentValue = perceivedLegendValue(series.id, series.currentValue);

    return {
      ...series,
      currentValue,
      data: [
        ...series.data.slice(Math.max(0, series.data.length - (MAX_POINTS - 1))),
        { timestamp: now, value: nextChartValue },
      ],
    };
  });

  return {
    ...data,
    readingCount: data.readingCount + 1,
    series: nextSeries,
  };
}

/** Live chart stream — one interval, batched meta string updates. */
export function useLiveData(initial: TelemetryData, streaming = false, smooth = true) {
  const [data, setData] = useState(() => cloneTelemetry(initial));
  const [lastReadingAgo, setLastReadingAgo] = useState(() =>
    formatLiveStreamMeta(initial.anchorUpdatedAt, streaming && smooth, Date.now()),
  );
  const upstreamSignature = useRef(telemetrySignature(initial));
  const anchorRef = useRef(initial.anchorUpdatedAt);

  useEffect(() => {
    const signature = telemetrySignature(initial);
    if (signature === upstreamSignature.current) return;
    upstreamSignature.current = signature;
    const cloned = cloneTelemetry(initial);
    anchorRef.current = cloned.anchorUpdatedAt;
    setData(cloned);
    setLastReadingAgo(formatLiveStreamMeta(cloned.anchorUpdatedAt, streaming && smooth, Date.now()));
  }, [initial, streaming, smooth]);

  useEffect(() => {
    if (!streaming) {
      setLastReadingAgo(formatLiveStreamMeta(anchorRef.current, false, Date.now()));
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (smooth) {
        setData((current) => {
          const next = appendStreamPoint(current, now);
          anchorRef.current = next.anchorUpdatedAt;
          return next;
        });
      }
      setLastReadingAgo((prev) => {
        const label = formatLiveStreamMeta(anchorRef.current, smooth, now);
        return prev === label ? prev : label;
      });
    }, FRONTEND_STREAM_TICK_MS);

    return () => clearInterval(interval);
  }, [streaming, smooth]);

  return {
    ...data,
    isLive: streaming,
    lastReadingAgo,
  };
}
