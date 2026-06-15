/** @deprecated Prefer `ds` from designSystem — kept for gradual migration. */
import { ds } from '@/esopay/theme/designSystem';

export const luxury = {
  bg: ds.color.bg,
  surface: ds.color.surface1,
  surface2: ds.color.surface2,
  gold: ds.color.gold,
  goldAccent: ds.color.gold,
  goldDim: ds.color.goldMuted12,
  goldBorder: ds.color.border,
  goldGlow: ds.color.goldMuted12,
  textPrimary: ds.color.textPrimary,
  warmWhite: ds.color.textPrimary,
  textMuted: ds.color.textMuted,
  textSecondary: ds.color.textSecondary,
  textDim: ds.color.textDisabled,
  green: ds.color.gold,
  walletGradient: [ds.color.surface1, ds.color.surface1] as const,
  glass: ds.color.goldMuted04,
} as const;

