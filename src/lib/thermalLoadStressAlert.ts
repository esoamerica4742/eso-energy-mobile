import { Colors } from '@/tokens/design';
import type { TelemetryPoint } from '@/stores/telemetryStore';

export type ThermalLoadStressStatus = 'clear' | 'watch' | 'alert';

export type ThermalLoadStressSnapshot = {
  enabled: boolean;
  title: string;
  subLabel: string;
  safetyMargin: number;
  status: ThermalLoadStressStatus;
  statusLabel: string;
  temperatureC: number | null;
  peakTemperatureC: number | null;
  loadKw: number;
  peakLoadKw: number;
  thermalHeadroomPct: number;
  loadHeadroomPct: number;
  thermalStressPct: number;
  loadStressPct: number;
  activeAlerts: number;
  stressTrend: number[];
  recommendation: string;
};

const STATUS_LABEL: Record<ThermalLoadStressStatus, string> = {
  clear: 'CLEAR',
  watch: 'WATCH',
  alert: 'ALERT',
};

const TEMP_WARN_C = 45;
const TEMP_CRIT_C = 55;
const TEMP_FAULT_C = 75;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveStatus(margin: number): ThermalLoadStressStatus {
  if (margin >= 85) return 'clear';
  if (margin >= 65) return 'watch';
  return 'alert';
}

function loadCapacityKw(powerKw: number, history: TelemetryPoint[]) {
  const histPeak = history.reduce((max, p) => Math.max(max, p.load_kw ?? 0), 0);
  return Math.max(powerKw * 1.35, histPeak * 1.08, 320);
}

function thermalHeadroom(tempC: number | null) {
  if (tempC == null) return 72;
  if (tempC >= TEMP_FAULT_C) return 0;
  if (tempC >= TEMP_CRIT_C) return clamp(Math.round(((TEMP_FAULT_C - tempC) / (TEMP_FAULT_C - TEMP_CRIT_C)) * 35), 5, 35);
  if (tempC >= TEMP_WARN_C) return clamp(Math.round(55 + ((TEMP_CRIT_C - tempC) / (TEMP_CRIT_C - TEMP_WARN_C)) * 25), 40, 80);
  return clamp(Math.round(88 - tempC * 0.35), 55, 100);
}

function loadHeadroom(loadKw: number, capacityKw: number) {
  if (capacityKw <= 0) return 0;
  const utilization = loadKw / capacityKw;
  if (utilization >= 1) return 0;
  return clamp(Math.round((1 - utilization) * 100), 0, 100);
}

function stressPercent(history: TelemetryPoint[], kind: 'thermal' | 'load', capacityKw: number) {
  if (history.length === 0) return 0;
  const hot = history.filter((p) => (p.temperature_c ?? 0) >= TEMP_WARN_C).length;
  const heavy = history.filter((p) => (p.load_kw ?? 0) / capacityKw >= 0.82).length;
  const count = kind === 'thermal' ? hot : heavy;
  return Math.round((count / history.length) * 100);
}

function peakFromHistory(history: TelemetryPoint[], field: 'temperature_c' | 'load_kw', live: number | null) {
  const histPeak = history.reduce((max, p) => Math.max(max, p[field] ?? 0), 0);
  if (live == null) return histPeak || null;
  return Math.max(histPeak, live);
}

function stressTrend(history: TelemetryPoint[], deviceId: string, margin: number, capacityKw: number) {
  if (history.length >= 4) {
    const chunk = Math.max(1, Math.floor(history.length / 10));
    const trend: number[] = [];
    for (let i = chunk; i <= history.length; i += chunk) {
      const slice = history.slice(Math.max(0, i - chunk), i);
      const avgTemp = slice.reduce((sum, p) => sum + (p.temperature_c ?? 0), 0) / slice.length;
      const avgLoad = slice.reduce((sum, p) => sum + (p.load_kw ?? 0), 0) / slice.length;
      const tHead = thermalHeadroom(avgTemp);
      const lHead = loadHeadroom(avgLoad, capacityKw);
      trend.push(clamp(Math.round((tHead + lHead) / 2), 20, 100));
    }
    return trend.length >= 2 ? trend : [margin, margin];
  }
  return [margin, margin];
}

function countActiveAlerts(input: {
  tempC: number | null;
  loadKw: number;
  capacityKw: number;
  thermalStressPct: number;
  loadStressPct: number;
}) {
  let alerts = 0;
  if (input.tempC != null && input.tempC >= TEMP_WARN_C) alerts += 1;
  if (input.tempC != null && input.tempC >= TEMP_CRIT_C) alerts += 1;
  if (input.loadKw / input.capacityKw >= 0.85) alerts += 1;
  if (input.thermalStressPct > 18) alerts += 1;
  if (input.loadStressPct > 18) alerts += 1;
  return alerts;
}

function recommendation(input: {
  status: ThermalLoadStressStatus;
  tempC: number | null;
  loadKw: number;
  capacityKw: number;
  live: boolean;
}) {
  if (!input.live) {
    return 'Stress monitoring paused until live telemetry returns.';
  }
  if (input.status === 'alert') {
    if (input.tempC != null && input.tempC >= TEMP_CRIT_C) {
      return 'Critical thermal threshold — reduce load and verify inverter cooling immediately.';
    }
    return 'Load envelope exceeded — shed non-critical circuits or shift to battery reserve.';
  }
  if (input.tempC != null && input.tempC >= TEMP_WARN_C) {
    return 'Thermal trend elevated — inspect ventilation and ambient airflow around inverter bay.';
  }
  if (input.loadKw / input.capacityKw >= 0.8) {
    return 'Load approaching site ceiling — schedule demand smoothing before peak window.';
  }
  return 'Thermal and load envelopes are within safe operating margins.';
}

function buildSubLabel(status: ThermalLoadStressStatus, live: boolean) {
  if (!live) return 'AWAITING LIVE TELEMETRY';
  if (status === 'clear') return 'SAFE OPERATING ENVELOPE';
  if (status === 'watch') return 'STRESS WATCH · HEADROOM MONITOR';
  return 'ALERT THRESHOLD · ACTIVE';
}

export function buildThermalLoadStressAlert(input: {
  live: boolean;
  temperatureC?: number | null;
  loadKw?: number | null;
  powerKw?: number | null;
  history?: TelemetryPoint[];
  deviceId?: string;
}): ThermalLoadStressSnapshot {
  const history = input.history ?? [];
  const tempC = input.temperatureC ?? null;
  const loadKw = Math.round(input.loadKw ?? 0);
  const powerKw = input.powerKw ?? 0;
  const capacityKw = loadCapacityKw(powerKw, history);

  const thermalHeadroomPct = input.live ? thermalHeadroom(tempC) : 0;
  const loadHeadroomPct = input.live ? loadHeadroom(loadKw, capacityKw) : 0;
  const thermalStressPct = input.live ? stressPercent(history, 'thermal', capacityKw) : 0;
  const loadStressPct = input.live ? stressPercent(history, 'load', capacityKw) : 0;

  let safetyMargin = input.live ? Math.round((thermalHeadroomPct + loadHeadroomPct) / 2) : 0;
  if (tempC != null && tempC >= TEMP_FAULT_C) safetyMargin = Math.min(safetyMargin, 15);
  safetyMargin = clamp(safetyMargin, 0, 100);

  const status = input.live ? resolveStatus(safetyMargin) : 'watch';
  const activeAlerts = input.live
    ? countActiveAlerts({ tempC, loadKw, capacityKw, thermalStressPct, loadStressPct })
    : 0;

  return {
    enabled: input.live,
    title: 'Thermal Load Monitor',
    subLabel: buildSubLabel(status, input.live),
    safetyMargin,
    status,
    statusLabel: input.live ? STATUS_LABEL[status] : 'STANDBY',
    temperatureC: tempC,
    peakTemperatureC: peakFromHistory(history, 'temperature_c', tempC),
    loadKw,
    peakLoadKw: Math.round(peakFromHistory(history, 'load_kw', loadKw) ?? loadKw),
    thermalHeadroomPct,
    loadHeadroomPct,
    thermalStressPct,
    loadStressPct,
    activeAlerts,
    stressTrend: stressTrend(history, input.deviceId ?? 'stress-alert', safetyMargin, capacityKw),
    recommendation: recommendation({ status, tempC, loadKw, capacityKw, live: input.live }),
  };
}

export function stressBorderVariant(status: ThermalLoadStressStatus, enabled: boolean) {
  if (!enabled) return 'muted' as const;
  if (status === 'alert') return 'alert' as const;
  if (status === 'watch') return 'amber' as const;
  return 'gold' as const;
}

export function stressStatusAccent(status: ThermalLoadStressStatus, enabled: boolean) {
  if (!enabled) return Colors.textMuted;
  if (status === 'clear') return Colors.mint;
  if (status === 'watch') return Colors.gold;
  return Colors.alert;
}

export function stressBadgeBg(status: ThermalLoadStressStatus, enabled: boolean) {
  if (!enabled) return Colors.surfaceRaised;
  if (status === 'clear') return Colors.mintGlow;
  if (status === 'watch') return Colors.goldWhisper;
  return Colors.alertMuted;
}

export function formatLoadLabel(loadKw: number) {
  if (loadKw >= 1000) return `${(loadKw / 1000).toFixed(1)} MW`;
  return `${Math.round(loadKw)} kW`;
}

export function formatTempLabel(tempC: number | null) {
  if (tempC == null) return '—';
  return `${Math.round(tempC)}°C`;
}
