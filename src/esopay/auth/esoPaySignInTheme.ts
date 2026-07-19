/** Eso Pay sign-in screen tokens — quiet black / white dialect. */
import { ds, ESO_PAY_CANVAS_BG } from '@/esopay/theme/designSystem';

/** Text fields and selectors — instant border swap on focus (no animation). */
export const AUTH_INPUT_BORDER = {
  rest: 'rgba(255,255,255,0.08)',
  focus: 'rgba(255,255,255,0.55)',
} as const;

/** Sign-in email field — recessed surface, white focus ring. */
export const SIGN_IN_EMAIL_INPUT = {
  bg: '#1C1C1E',
  borderRest: 'rgba(255, 255, 255, 0.12)',
  borderFocus: 'rgba(255, 255, 255, 0.55)',
  text: '#FFFFFF',
  placeholder: 'rgba(255, 255, 255, 0.34)',
} as const;

export const ESOPAY_SIGN_IN = {
  bg: ESO_PAY_CANVAS_BG,
  surface: ds.color.surface1,
  surfaceRaised: ds.color.surface2,
  border: ds.color.border,
  teal: ds.color.teal,
  gold: ds.color.gold,
  /** CTA label on white chrome fill. */
  buttonText: '#000000',
  /** OTP digit wells. */
  otpBg: ds.color.surface1,
  warmWhite: ds.color.textPrimary,
  muted: ds.color.textMuted,
  placeholder: ds.color.textPlaceholder,
  disabledText: ds.color.textDisabled,
  legal: ds.color.textSecondary,
} as const;
