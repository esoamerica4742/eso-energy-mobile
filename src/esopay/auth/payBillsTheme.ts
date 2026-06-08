import { inter } from '@/theme/fonts';

/** ESO Pay Bills auth — design tokens (private banking / monochrome) */
export const PayBills = {
  bgPrimary: '#080808',
  bgSurface: '#111111',
  bgInput: '#161616',
  borderDefault: '#1E1E1E',
  borderInput: '#2A2A2A',
  borderFocus: '#C9A84C',
  gold: '#C9A84C',
  gold1: '#F0D080',
  gold2: '#C9A84C',
  textPrimary: '#FFFFFF',
  textSecondary: '#666666',
  textMuted: '#333333',
  textHelper: '#444444',
  textBack: '#C9A84C',
  btnText: '#FFFFFF',
  error: '#FF4444',
  success: '#22C55E',
  maxWidth: 390,
} as const;

export const PayBillsFonts = {
  sora: inter.bold,
  soraExtra: inter.bold,
  soraRegular: inter.regular,
  soraMedium: inter.medium,
  soraSemi: inter.semibold,
  dmSans: inter.regular,
  dmMedium: inter.medium,
  dmBold: inter.bold,
} as const;
