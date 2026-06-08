import type { BatteryLifespanSnapshot } from '@/lib/batteryLifespanGuard';
import type { DieselFraudAuditSnapshot } from '@/lib/dieselFraudAuditData';
import type { ThermalLoadStressSnapshot } from '@/lib/thermalLoadStressAlert';
import { tagInsight, type FleetInsight } from '@/lib/monitoring/fleetInsights';
import type { AiInsight } from '@/services/supabase/aiInsights';

type Input = {
  deviceId: string;
  streamingLive: boolean;
  powerKw: number;
  loadKw: number;
  soc: number;
  tempC: number | null;
  vsSevenDayAvgPct?: number;
  dieselAudit?: DieselFraudAuditSnapshot;
  batteryGuard?: BatteryLifespanSnapshot;
  thermal?: ThermalLoadStressSnapshot;
};

function mk(
  id: string,
  deviceId: string,
  type: AiInsight['type'],
  score: number,
  message: string,
  recommendation: string | null,
): FleetInsight {
  return tagInsight(
    {
      id,
      device_id: deviceId,
      type,
      score,
      message,
      recommendation,
      created_at: new Date().toISOString(),
      expires_at: null,
    },
    'telemetry',
  );
}

/** Live telemetry + guard models — fills the gap when ML pipeline has no rows yet. */
export function buildTelemetryDerivedInsights(input: Input): FleetInsight[] {
  if (!input.streamingLive || !input.deviceId) return [];

  const insights: FleetInsight[] = [];
  const { deviceId, powerKw, loadKw, soc, tempC } = input;

  const solarSharePct = loadKw > 0 ? Math.round((powerKw / loadKw) * 100) : powerKw > 0 ? 100 : 0;

  if (solarSharePct >= 55) {
    insights.push(
      mk(
        'live-efficiency',
        deviceId,
        'efficiency',
        Math.min(0.92, 0.55 + solarSharePct / 200),
        `Solar is covering ${solarSharePct}% of current site draw (${Math.round(powerKw)} kW / ${Math.round(loadKw)} kW).`,
        'Maintain MPPT schedule — no dispatch change required at this load.',
      ),
    );
  } else if (loadKw > 0 && powerKw / loadKw < 0.5) {
    insights.push(
      mk(
        'live-low-solar',
        deviceId,
        'optimization',
        0.74,
        `Solar offset is ${solarSharePct}% — grid or diesel is carrying most of ${Math.round(loadKw)} kW load.`,
        'Review peak window scheduling or battery reserve before evening ramp.',
      ),
    );
  }

  if (input.vsSevenDayAvgPct != null && Math.abs(input.vsSevenDayAvgPct) >= 8) {
    insights.push(
      mk(
        'live-load-trend',
        deviceId,
        'anomaly',
        0.68,
        input.vsSevenDayAvgPct > 0
          ? `Load is ${Math.abs(input.vsSevenDayAvgPct)}% below the 7-day session average.`
          : `Load is ${Math.abs(input.vsSevenDayAvgPct)}% above the 7-day session average.`,
        'Compare against production logs if diesel variance widens.',
      ),
    );
  }

  const thermal = input.thermal;
  if (thermal?.enabled && thermal.status !== 'clear') {
    insights.push(
      mk(
        'live-thermal',
        deviceId,
        thermal.status === 'alert' ? 'predictive_failure' : 'anomaly',
        thermal.status === 'alert' ? 0.88 : 0.72,
        thermal.recommendation,
        'Open Thermal Load Monitor for headroom detail.',
      ),
    );
  }

  const diesel = input.dieselAudit;
  if (diesel?.enabled && (diesel.status === 'flagged' || diesel.status === 'review')) {
    insights.push(
      mk(
        'live-diesel',
        deviceId,
        'anomaly',
        diesel.status === 'flagged' ? 0.9 : 0.75,
        diesel.recommendation,
        `Integrity score ${diesel.integrityScore}% · variance ${diesel.variancePct}%.`,
      ),
    );
  }

  const battery = input.batteryGuard;
  if (battery?.enabled && (battery.status === 'watch' || battery.status === 'protect')) {
    insights.push(
      mk(
        'live-battery',
        deviceId,
        battery.status === 'protect' ? 'predictive_failure' : 'optimization',
        battery.status === 'protect' ? 0.85 : 0.7,
        battery.recommendation,
        `SOC ${battery.socPct}% · ${battery.remainingLifeLabel}.`,
      ),
    );
  }

  if (soc <= 18 && loadKw > powerKw) {
    insights.push(
      mk(
        'live-soc',
        deviceId,
        'predictive_failure',
        0.8,
        `Battery reserve at ${soc}% while load exceeds solar output.`,
        'Recharge or shed non-critical circuits before peak window.',
      ),
    );
  }

  if (tempC != null && tempC >= 42 && !insights.some((i) => i.id === 'live-thermal')) {
    insights.push(
      mk(
        'live-temp',
        deviceId,
        'anomaly',
        tempC >= 55 ? 0.86 : 0.7,
        `Inverter bay at ${Math.round(tempC)}°C — thermal headroom narrowing.`,
        'Verify ventilation and ambient cooling around the cabinet.',
      ),
    );
  }

  return insights.slice(0, 5);
}
