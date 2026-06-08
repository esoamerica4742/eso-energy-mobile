import type { FleetInsight } from '@/lib/monitoring/fleetInsights';
import type { TelemetryPoint } from '@/stores/telemetryStore';

type GuardHints = {
  batteryStatus?: 'optimal' | 'watch' | 'protect';
  dieselStatus?: 'clear' | 'review' | 'flagged';
  thermalStatus?: 'clear' | 'watch' | 'alert';
};

type Input = {
  deviceId: string;
  telemetry: TelemetryPoint;
  solarSharePct: number;
  vsSevenDayAvgPct: number;
  alertCount: number;
  guards?: GuardHints;
};

/** Live telemetry analysis when ML pipeline has not published rows yet — real numbers only. */
export function generateTelemetryInsights(input: Input): FleetInsight[] {
  const { deviceId, telemetry, solarSharePct, vsSevenDayAvgPct, alertCount, guards } = input;
  const now = new Date().toISOString();
  const load = telemetry.load_kw ?? 0;
  const power = telemetry.power_kw ?? 0;
  const soc = telemetry.battery_pct ?? 0;
  const temp = telemetry.temperature_c ?? null;
  const insights: FleetInsight[] = [];

  if (load > 0 && power > 0) {
    const efficiency = Math.round((power / load) * 100);
    insights.push({
      id: `telemetry-efficiency-${deviceId}`,
      device_id: deviceId,
      type: 'efficiency',
      score: clampScore(efficiency / 100),
      message: `Solar offset covers ${solarSharePct}% of site draw (${Math.round(load)} kW load, ${power.toFixed(1)} kW solar).`,
      recommendation:
        efficiency >= 85
          ? 'Generation and load are well balanced — maintain current dispatch.'
          : 'Consider shedding non-critical load during the next peak window.',
      created_at: now,
      expires_at: null,
      source: 'telemetry',
    });
  }

  if (vsSevenDayAvgPct !== 0) {
    const improving = vsSevenDayAvgPct > 0;
    insights.push({
      id: `telemetry-load-trend-${deviceId}`,
      device_id: deviceId,
      type: 'optimization',
      score: 0.75,
      message: improving
        ? `Load is ${Math.abs(vsSevenDayAvgPct)}% below the 7-day session average.`
        : `Load is ${Math.abs(vsSevenDayAvgPct)}% above the 7-day session average.`,
      recommendation: improving
        ? 'Solar share is outperforming recent baseline — good window for battery reserve recovery.'
        : 'Demand is rising vs baseline — review peak shaving before the next tariff window.',
      created_at: now,
      expires_at: null,
      source: 'telemetry',
    });
  }

  if (soc <= 20 && load > power) {
    insights.push({
      id: `telemetry-battery-${deviceId}`,
      device_id: deviceId,
      type: 'predictive_failure',
      score: 0.82,
      message: `Battery reserve at ${Math.round(soc)}% while grid draw exceeds solar output.`,
      recommendation: 'Raise minimum reserve or schedule a top-up before the evening peak.',
      created_at: now,
      expires_at: null,
      source: 'telemetry',
    });
  }

  if (temp != null && temp >= 42) {
    insights.push({
      id: `telemetry-thermal-${deviceId}`,
      device_id: deviceId,
      type: 'anomaly',
      score: 0.78,
      message: `Inverter bay at ${temp.toFixed(1)}°C — thermal headroom is narrowing.`,
      recommendation: guards?.thermalStatus === 'alert'
        ? 'Active thermal alert — verify cooling airflow immediately.'
        : 'Inspect ventilation and ambient cooling around the inverter.',
      created_at: now,
      expires_at: null,
      source: 'telemetry',
    });
  }

  if (guards?.dieselStatus === 'flagged' || guards?.dieselStatus === 'review') {
    insights.push({
      id: `telemetry-diesel-${deviceId}`,
      device_id: deviceId,
      type: 'anomaly',
      score: guards.dieselStatus === 'flagged' ? 0.88 : 0.7,
      message: 'Diesel integrity ledger flagged a variance against live solar contribution.',
      recommendation: 'Reconcile generator runtime logs with the 24h telemetry ledger.',
      created_at: now,
      expires_at: null,
      source: 'telemetry',
    });
  }

  if (alertCount > 0) {
    insights.push({
      id: `telemetry-alerts-${deviceId}`,
      device_id: deviceId,
      type: 'predictive_failure',
      score: clampScore(0.6 + alertCount * 0.05),
      message: `${alertCount} open fleet alert${alertCount === 1 ? '' : 's'} on this site.`,
      recommendation: 'Review the Alerts tab and acknowledge critical items first.',
      created_at: now,
      expires_at: null,
      source: 'telemetry',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: `telemetry-sync-${deviceId}`,
      device_id: deviceId,
      type: 'efficiency',
      score: 0.65,
      message: 'Live telemetry stream is healthy — awaiting ML pipeline publish.',
      recommendation: 'Fleet ML insights refresh every 10 minutes when the backend job runs.',
      created_at: now,
      expires_at: null,
      source: 'telemetry',
    });
  }

  return insights.slice(0, 5);
}

function clampScore(value: number) {
  return Math.max(0.35, Math.min(0.98, value));
}
