import type { AiInsight } from '@/services/supabase/aiInsights';

/** Curated demo insights — only shown when demo mode is active (labeled in UI). */
export function getDemoAiInsights(deviceIds?: string[]): AiInsight[] {
  const deviceId = deviceIds?.[0] ?? 'demo-inverter';
  const now = new Date().toISOString();

  return [
    {
      id: 'demo-insight-efficiency',
      device_id: deviceId,
      type: 'efficiency',
      score: 0.86,
      message: 'Solar contribution peaked 14% above the 7-day rolling average during midday.',
      recommendation: 'Maintain current MPPT setpoint — no dispatch change required.',
      created_at: now,
      expires_at: null,
    },
    {
      id: 'demo-insight-anomaly',
      device_id: deviceId,
      type: 'anomaly',
      score: 0.72,
      message: 'Load ramp detected without matching solar offset — review generator runtime logs.',
      recommendation: 'Cross-check diesel ledger entries for the last 24 hours.',
      created_at: now,
      expires_at: null,
    },
    {
      id: 'demo-insight-optimization',
      device_id: deviceId,
      type: 'optimization',
      score: 0.79,
      message: 'Battery reserve can support an additional 2.1h at current draw without grid assist.',
      recommendation: 'Consider shifting non-critical loads to the solar peak window.',
      created_at: now,
      expires_at: null,
    },
  ];
}
