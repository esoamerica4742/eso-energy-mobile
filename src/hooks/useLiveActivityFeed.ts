import { useEffect, useMemo, useState } from 'react';
import type { OperationalInsight } from '@/lib/perceivedRealtime';

const ROTATE_MS = 8_000;

/** Rotates operational insights — subtle live activity feed. */
export function useLiveActivityFeed(insights: OperationalInsight[], enabled = true) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [insights.map((i) => i.id).join('|')]);

  useEffect(() => {
    if (!enabled || insights.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % insights.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [enabled, insights.length]);

  return insights[index] ?? insights[0] ?? null;
}
