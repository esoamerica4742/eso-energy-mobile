import type { DataPoint, ChartDimensions } from '@/types/telemetry';
import { ChartMetrics } from '@/tokens/design';

const padding = ChartMetrics.chartPadding;

export function dataToPath(
  data: DataPoint[],
  dimensions: ChartDimensions,
  yMin: number,
  yMax: number,
  close = false,
): string {
  if (data.length < 2) return '';

  const { plotWidth, plotHeight } = dimensions;
  const range = yMax - yMin || 1;

  const xScale = (index: number): number =>
    (index / (data.length - 1)) * (plotWidth - padding.right);

  const yScale = (value: number): number =>
    plotHeight - padding.top - ((value - yMin) / range) * (plotHeight - padding.top);

  const points = data.map((point, index) => ({
    x: xScale(index),
    y: yScale(point.value),
  }));

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    path += ` C ${cpX} ${prev.y} ${cpX} ${curr.y} ${curr.x} ${curr.y}`;
  }

  if (close) {
    const lastX = points[points.length - 1].x;
    path += ` L ${lastX} ${plotHeight} L 0 ${plotHeight} Z`;
  }

  return path;
}

export function getLastPoint(
  data: DataPoint[],
  dimensions: ChartDimensions,
  yMin: number,
  yMax: number,
): { x: number; y: number } {
  const { plotWidth, plotHeight } = dimensions;
  const range = yMax - yMin || 1;
  const lastValue = data[data.length - 1]?.value ?? yMin;

  return {
    x: plotWidth - padding.right,
    y:
      plotHeight -
      padding.top -
      ((lastValue - yMin) / range) * (plotHeight - padding.top),
  };
}

export function getYAxisLabels(
  yMin: number,
  yMax: number,
  count: number,
  unit: string,
): string[] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const value = yMin + (index / count) * (yMax - yMin);
    return `${value.toFixed(1)} ${unit}`;
  }).reverse();
}

export function getPathLength(path: string): number {
  if (!path) return 0;
  return Math.max(path.length * 0.55, 240);
}
