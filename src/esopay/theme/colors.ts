import { ds } from '@/esopay/theme/designSystem';
import { GOLD } from '@/theme/colors';

/** Eso Pay palette — derived from the global design system. */
export const colors = {
  black: ds.color.bg,
  surface: ds.color.surface1,
  card: ds.color.surface1,
  border: ds.color.borderSubtle,
  surface2: ds.color.surface2,
  gold: ds.color.gold,
  goldDim: ds.color.goldMuted08,
  goldBright: ds.color.gold,
  goldAccent: ds.color.gold,
  goldDark: ds.color.gold,
  goldGlow: ds.color.goldMuted12,
  goldBorder: ds.color.border,
  fundWalletShadow: ds.color.goldMuted35,
  white: ds.color.display,
  muted: ds.color.textMuted,
  inactive: ds.color.textDisabled,
  success: ds.color.gold,
  teal: ds.color.gold,
  lime: ds.color.gold,
  limeGlow: ds.color.goldMuted12,
  limePillBg: ds.color.goldMuted12,
  limeBorder: 'rgba(232, 160, 32, 0.28)',
  limeBorderStrong: 'rgba(232, 160, 32, 0.38)',
  warning: ds.color.warning,
  danger: ds.color.error,
  navBg: ds.color.navBg,
  navBorder: ds.color.border,
  navActivePill: ds.color.goldMuted12,
} as const;

export type EsoPayColor = keyof typeof colors;

