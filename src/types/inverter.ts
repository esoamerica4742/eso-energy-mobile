export type MetricStatus =
  | 'normal'
  | 'low'
  | 'critical'
  | 'high'
  | 'warning'
  | 'live';

export type UnitPosition = 'inline';

export interface BatteryMetric {
  percentage: number;
  status: MetricStatus;
}

export interface LoadMetric {
  value: number;
  unit: string;
  label: string;
  signalLevel: number;
}

export interface PowerMetric {
  value: number;
  unit: string;
  label: string;
}

export interface TempMetric {
  value: number;
  unit: string;
  status: MetricStatus;
}

export interface InverterData {
  id: string;
  name: string;
  site: string;
  isLive: boolean;
  connectionStatus?: import('@/types/dashboard').ConnectionStatus;
  battery: BatteryMetric;
  load: LoadMetric;
  power: PowerMetric;
  temp: TempMetric;
}
