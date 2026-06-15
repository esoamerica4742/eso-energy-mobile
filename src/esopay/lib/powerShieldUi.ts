import type { PowerShieldAlertLevel, PowerShieldMeter } from '@/esopay/api/types';
import { GOLD } from '@/theme/colors';



export const POWER_SHIELD_ALERT_COPY: Record<

  PowerShieldAlertLevel,

  { title: string; tone: string; hint: string }

> = {

  safe: {

    title: 'Supply looks good',

    tone: '#10B981',

    hint: 'Volume-based alerts at 10% and 5% of your last token batch (kWh).',

  },

  warn_10: {

    title: '10% capacity — auto top-up window',

    tone: '#F59E0B',

    hint: '10% of vended kWh left. Secure your utility reserve.',

  },

  critical: {

    title: 'CRITICAL — blackout imminent',

    tone: '#DC2626',

    hint: '5% of vended kWh left. Enable auto top-up to vend from your Monnify wallet.',

  },

  expired: {

    title: 'Token likely depleted',

    tone: '#E53E3E',

    hint: 'Recharge immediately to restore supply.',

  },

  unknown: {

    title: 'Activate Power Shield',

    tone: GOLD,

    hint: 'Pay electricity once — we track prepaid capacity and alert before blackout.',

  },

};



export function isPowerShieldCriticalPanic(meter: PowerShieldMeter): boolean {

  return meter.alert_level === 'critical' || meter.alert_state === 'critical';

}



export function formatHoursRemaining(hours: number | null | undefined): string {

  if (hours == null || Number.isNaN(hours)) return '—';

  if (hours <= 0) return 'Now';

  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;

  if (hours < 48) return `${Math.round(hours)}h`;

  const days = Math.floor(hours / 24);

  const rem = Math.round(hours % 24);

  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;

}



export function formatCapacityPct(pct: number | null | undefined): string {

  if (pct == null || Number.isNaN(pct)) return '—';

  return `${Math.max(0, Math.round(pct))}%`;

}



export function countdownProgress(meter: PowerShieldMeter): number {

  if (meter.capacity_remaining_pct != null && !Number.isNaN(meter.capacity_remaining_pct)) {

    return Math.min(1, Math.max(0, 1 - meter.capacity_remaining_pct / 100));

  }

  if (!meter.estimated_depletion_at || !meter.last_purchase_at || !meter.last_purchase_amount_kobo) {

    return 0;

  }

  const start = new Date(meter.last_purchase_at).getTime();

  const end = new Date(meter.estimated_depletion_at).getTime();

  const span = end - start;

  if (span <= 0) return 0;

  const elapsed = Date.now() - start;

  return Math.min(1, Math.max(0, elapsed / span));

}



export function suggestedDailySpendOptionsKobo(): number[] {

  return [20_000, 50_000, 100_000, 200_000, 500_000];

}


