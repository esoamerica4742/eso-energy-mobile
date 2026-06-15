/** Eso Pay sign-in screen tokens — alias of global design system. */
import { ds, ESO_PAY_CANVAS_BG } from '@/esopay/theme/designSystem';
import { GOLD } from '@/theme/colors';

/** Text fields and selectors — instant border swap on focus (no animation). */
export const AUTH_INPUT_BORDER = {
  rest: 'rgba(255,255,255,0.08)',
  focus: GOLD,
} as const;

/** Sign-in email field — recessed gold tint, not a heavy outline. */
export const SIGN_IN_EMAIL_INPUT = {
  bg: '#0F1520',
  borderRest: 'rgba(201, 168, 76, 0.35)',
  borderFocus: 'rgba(201, 168, 76, 0.85)',
  text: '#F5F0E8',
  placeholder: 'rgba(245, 240, 232, 0.35)',
} as const;

export const ESOPAY_SIGN_IN = {
  bg: ds.color.bg,
  surface: ds.color.surface1,
  surfaceRaised: ds.color.surface2,
  border: ds.color.border,
  teal: ds.color.teal,
  gold: ds.color.gold,
  warmWhite: ds.color.textPrimary,
  muted: ds.color.textMuted,
  placeholder: ds.color.textPlaceholder,
  disabledText: ds.color.textDisabled,
  legal: ds.color.textSecondary,
} as const;
