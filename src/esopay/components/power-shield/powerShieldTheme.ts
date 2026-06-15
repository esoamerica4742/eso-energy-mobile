import { StyleSheet } from 'react-native';
import type { PowerShieldAlertLevel, PowerShieldMeter } from '@/esopay/api/types';
import { countdownProgress } from '@/esopay/lib/powerShieldUi';
import { ds } from '@/esopay/theme/designSystem';

/** Power Shield — aligned to global Eso Pay design system. */
export const PS = {
  bg: ds.color.bg,
  card: ds.color.surface1,
  surface: ds.color.surface1,
  surface2: ds.color.surface2,
  border: ds.color.border,
  borderSubtle: ds.color.borderSubtle,
  gold: ds.color.gold,
  teal: ds.color.gold,
  text: ds.color.textPrimary,
  textSecondary: ds.color.textSecondary,
  textMuted: ds.color.textMuted,
  textDisabled: ds.color.textDisabled,
  error: ds.color.error,
  warning: ds.color.warning,
  inactive: ds.color.textDisabled,
  green: ds.color.gold,
  crimson: ds.color.error,
  amber: ds.color.warning,
  amberDim: ds.color.warningMuted,
  amberBorder: ds.color.warning,
  goldDim: ds.color.goldMuted12,
  goldGlow: ds.color.goldMuted20,
  locked: ds.color.textDisabled,
  textDim: ds.color.textMuted,
  crimsonBorder: ds.color.error,
  crimsonDim: ds.color.errorMuted,
  track: ds.color.border,
} as const;

export function ringColorForProgress(pct: number | null | undefined): string {
  if (pct == null) return PS.inactive;
  if (pct <= 5) return PS.crimson;
  if (pct <= 10) return PS.amber;
  return PS.gold;
}

export const psFont = {
  display: ds.font.headline,
  displayMedium: ds.font.title,
  body: ds.font.body,
  bodyMedium: ds.font.bodyStrong,
  bodyBold: ds.font.headline,
  regular: ds.font.body,
  medium: ds.font.bodyStrong,
  bold: ds.font.headline,
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

export const formatBurnRateLabel = formatBurnUnitsLabel;

export const psStyles = StyleSheet.create({
  daysLarge: {
    fontFamily: psFont.display,
    fontSize: ds.type.title.fontSize,
    color: PS.text,
    textAlign: 'center',
  },
  burnRate: {
    fontFamily: psFont.bodyMedium,
    fontSize: ds.type.caption.fontSize,
    color: PS.textSecondary,
    textAlign: 'center',
  },
});

export function urgencyColor(
  hours: number | null | undefined,
  alertLevel?: PowerShieldAlertLevel,
): string {
  const days = daysRemainingCount(hours);
  if (alertLevel === 'expired' || alertLevel === 'critical' || (days != null && days < 2)) {
    return PS.error;
  }
  if (alertLevel === 'warn_10' || (days != null && days <= 4)) return PS.warning;
  if (days != null && days > 4) return PS.gold;
  return PS.warning;
}

export function arcColorForMeter(meter: PowerShieldMeter | null | undefined): string {
  const pct = meter?.volume_remaining_pct ?? meter?.capacity_remaining_pct ?? null;
  if (pct != null && pct <= 5) return PS.error;
  return PS.gold;
}

export type StatusPill = { label: string; bg: string; border: string; dot: string; text: string };

export function statusPillForMeter(
  isActive: boolean,
  meter: PowerShieldMeter | null | undefined,
): StatusPill {
  if (!isActive || !meter) {
    return {
      label: 'Inactive',
      bg: PS.surface2,
      border: PS.border,
      dot: PS.textDisabled,
      text: PS.textMuted,
    };
  }
  const atRisk =
    meter.alert_level === 'warn_10' ||
    meter.alert_level === 'critical' ||
    meter.alert_level === 'expired' ||
    (meter.capacity_remaining_pct != null && meter.capacity_remaining_pct <= 10);

  if (atRisk) {
    return {
      label: 'At Risk',
      bg: ds.color.errorMuted,
      border: PS.error,
      dot: PS.error,
      text: PS.error,
    };
  }
  return {
    label: 'Protected',
    bg: ds.color.goldMuted12,
    border: PS.gold,
    dot: PS.gold,
    text: PS.gold,
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
