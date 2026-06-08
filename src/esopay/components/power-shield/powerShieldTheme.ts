import type { PowerShieldAlertLevel, PowerShieldMeter } from '@/esopay/api/types';
import { countdownProgress } from '@/esopay/lib/powerShieldUi';

/** Power Shield v3 — Nigerian energy spec. */
export const PS = {
  bg: '#0A0A0A',
  card: '#111111',
  amber: '#F5A623',
  amberBorder: 'rgba(245, 166, 35, 0.12)',
  amberGlow: 'rgba(245, 166, 35, 0.35)',
  amberDim: 'rgba(245, 166, 35, 0.14)',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  green: '#22C55E',
  red: '#FF4444',
  crimson: '#DC2626',
  crimsonDim: 'rgba(127, 29, 29, 0.45)',
  crimsonBorder: 'rgba(220, 38, 38, 0.55)',
  surface: '#111111',
  border: 'rgba(255,255,255,0.08)',
  gold: '#C9A84C',
  goldDim: 'rgba(201, 168, 76, 0.14)',
  inactive: '#555555',
  track: 'rgba(255, 255, 255, 0.08)',
} as const;

/** Power Shield typography — Inter (global app font). */
export const psFont = {
  display: 'Inter_700Bold',
  displayMedium: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodyBold: 'Inter_700Bold',
} as const;

export function remainingFraction(meter: PowerShieldMeter | null | undefined): number {
  if (!meter) return 0;
  return Math.min(1, Math.max(0, 1 - countdownProgress(meter)));
}

export function daysRemainingCount(hours: number | null | undefined): number | null {
  if (hours == null || Number.isNaN(hours) || hours <= 0) return 0;
  return Math.max(0, Math.ceil(hours / 24));
}

export function formatDaysRemainingHeadline(hours: number | null | undefined): string {
  const days = daysRemainingCount(hours);
  if (days == null) return '—';
  if (days === 0) return 'Recharge now';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}

export function formatBurnUnitsLabel(dailySpendKobo: number): string {
  const naira = dailySpendKobo / 100;
  const units = Math.max(1, Math.round(naira / 60));
  return `Burning ${units} units/day`;
}

export function urgencyColor(
  hours: number | null | undefined,
  alertLevel?: PowerShieldAlertLevel,
): string {
  const days = daysRemainingCount(hours);
  if (alertLevel === 'expired' || alertLevel === 'critical' || (days != null && days < 2)) {
    return PS.crimson;
  }
  if (alertLevel === 'warn_10' || (days != null && days <= 4)) return PS.amber;
  if (days != null && days > 4) return PS.green;
  return PS.amber;
}

export function arcColorForMeter(meter: PowerShieldMeter | null | undefined): string {
  const pct = meter?.volume_remaining_pct ?? meter?.capacity_remaining_pct ?? null;
  if (pct != null && pct <= 5) return PS.red;
  return PS.amber;
}

export type StatusPill = { label: string; emoji: string; bg: string; text: string };

export function statusPillForMeter(
  isActive: boolean,
  meter: PowerShieldMeter | null | undefined,
): StatusPill {
  if (!isActive || !meter) {
    return {
      label: 'Inactive',
      emoji: '○',
      bg: 'rgba(85, 85, 85, 0.2)',
      text: PS.inactive,
    };
  }
  const atRisk =
    meter.alert_level === 'warn_10' ||
    meter.alert_level === 'critical' ||
    meter.alert_level === 'expired' ||
    (meter.capacity_remaining_pct != null && meter.capacity_remaining_pct <= 10) ||
    false;

  if (atRisk) {
    return {
      label: 'At Risk',
      emoji: '⚠️',
      bg: 'rgba(255, 68, 68, 0.12)',
      text: PS.red,
    };
  }
  return {
    label: 'Protected',
    emoji: '🟢',
    bg: 'rgba(34, 197, 94, 0.12)',
    text: PS.green,
  };
}

export function timelineFillRatio(alertLevel: PowerShieldAlertLevel | undefined): number {
  switch (alertLevel) {
    case 'critical':
    case 'expired':
      return 1;
    case 'warn_10':
      return 0.5;
    default:
      return 0;
  }
}
