import { inter } from '@/theme/fonts';

/** ESO Pay Bills auth — quiet black / white dialect */
export const PayBills = {
  bgPrimary: '#000000',
  bgSurface: '#1C1C1E',
  bgInput: '#1C1C1E',
  borderDefault: '#2C2C2E',
  borderInput: '#3A3A3C',
  borderFocus: 'rgba(255,255,255,0.55)',
  gold: '#FFFFFF',
  gold1: '#FFFFFF',
  gold2: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.34)',
  textHelper: 'rgba(255,255,255,0.45)',
  textBack: '#FFFFFF',
  btnText: '#000000',
  error: '#FF6B6B',
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
