import type { DataPoint, TelemetryData } from '@/types/telemetry';
import { ChartColors } from '@/tokens/design';

const generatePowerData = (points: number): DataPoint[] => {
  const now = Date.now();
  return Array.from({ length: points }, (_, index) => ({
    timestamp: now - (points - index) * 12000,
    value:
      1.8 +
      Math.sin(index * 0.4) * 0.6 +
      Math.random() * 0.3 +
      (index / points) * 0.4,
  }));
};

const generateLoadData = (points: number): DataPoint[] => {
  const now = Date.now();
  return Array.from({ length: points }, (_, index) => ({
    timestamp: now - (points - index) * 12000,
    value:
      2.2 +
      Math.sin(index * 0.4 + 0.5) * 0.5 +
      Math.random() * 0.25 +
      (index / points) * 0.35,
  }));
};

const generateBatteryData = (points: number): DataPoint[] => {
  const now = Date.now();
  return Array.from({ length: points }, (_, index) => ({
    timestamp: now - (points - index) * 12000,
    value: 0.02 + Math.random() * 0.03,
  }));
};

export const mockTelemetry: TelemetryData = {
  title: 'Live Telemetry',
  readingCount: 76,
  lastReadingAgo: 'last 5m ago',
  isLive: true,
  yMin: 0,
  yMax: 3.0,
  yUnit: 'kW',
  timeRangeLabel: '15m',
  series: [
    {
      id: 'power',
      label: 'Power',
      unit: 'kW',
      color: ChartColors.power,
      fillColor: ChartColors.powerFill,
      data: generatePowerData(76),
      currentValue: 312.7,
    },
    {
      id: 'load',
      label: 'Load',
      unit: 'kW',
      color: ChartColors.load,
      fillColor: ChartColors.loadFill,
      data: generateLoadData(76),
      currentValue: 405.5,
    },
    {
      id: 'battery',
      label: 'Battery',
      unit: '%',
      color: ChartColors.battery,
      fillColor: ChartColors.batteryFill,
      data: generateBatteryData(76),
      currentValue: 0,
    },
  ],
};

export function cloneTelemetry(data: TelemetryData): TelemetryData {
  return {
    ...data,
    series: data.series.map((series) => ({
      ...series,
      data: series.data.map((point) => ({ ...point })),
    })),
  };
}
