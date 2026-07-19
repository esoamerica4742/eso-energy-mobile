import { ds } from '@/esopay/theme/designSystem';

/** Eso Pay palette — derived from the global design system. */
export const colors = {
  black: ds.color.bg,
  surface: ds.color.surface1,
  card: ds.color.surface1,
  border: ds.color.borderSubtle,
  surface2: ds.color.surface2,
  gold: ds.color.gold,
  goldDim: ds.color.goldMuted08,
  goldBright: ds.color.textPrimary,
  goldAccent: ds.color.textPrimary,
  goldDark: ds.color.textSecondary,
  goldGlow: ds.color.goldMuted12,
  goldBorder: ds.color.border,
  fundWalletShadow: ds.color.goldMuted35,
  white: ds.color.display,
  muted: ds.color.textMuted,
  inactive: ds.color.textDisabled,
  success: '#34C759',
  teal: ds.color.textPrimary,
  lime: ds.color.textPrimary,
  limeGlow: ds.color.goldMuted12,
  limePillBg: ds.color.goldMuted12,
  limeBorder: 'rgba(255,255,255,0.22)',
  limeBorderStrong: 'rgba(255,255,255,0.35)',
  warning: ds.color.warning,
  danger: ds.color.error,
  navBg: ds.color.navBg,
  navBorder: ds.color.border,
  navActivePill: ds.color.goldMuted12,
} as const;

export type EsoPayColor = keyof typeof colors;

