export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface ChartSeries {
  id: string;
  label: string;
  unit: string;
  color: string;
  fillColor: string;
  data: DataPoint[];
  currentValue: number;
}

export interface TelemetryData {
  title: string;
  readingCount: number;
  lastReadingAgo: string;
  isLive: boolean;
  anchorUpdatedAt?: string | null;
  yMin: number;
  yMax: number;
  yUnit: string;
  timeRangeLabel: string;
  series: ChartSeries[];
}

export interface ChartDimensions {
  width: number;
  height: number;
  plotWidth: number;
  plotHeight: number;
}
