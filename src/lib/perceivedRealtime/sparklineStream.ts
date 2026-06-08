const MAX_POINTS = 24;

/** Append a perceived micro-point to a sparkline trend — realistic ±1–3% variation. */
export function appendSparklinePoint(
  trend: number[],
  nextValue: number,
  maxPoints = MAX_POINTS,
): number[] {
  if (trend.length === 0) return [nextValue];
  const last = trend[trend.length - 1] ?? nextValue;
  const blended = last * 0.55 + nextValue * 0.45;
  const jitter = blended * (1 + (Math.random() - 0.5) * 0.02);
  const point = Number(jitter.toFixed(3));
  return [...trend.slice(Math.max(0, trend.length - (maxPoints - 1))), point];
}

export function seedSparklineFromMetric(value: number, points = 12): number[] {
  const base = Math.max(value, 0.01);
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i * 0.55) * base * 0.04;
    return Number((base + wave).toFixed(3));
  });
}
