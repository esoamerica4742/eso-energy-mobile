import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { fonts as interFonts } from '@/theme/fonts';

/** Eso Pay font roles — Inter only. */
export const esopayFonts = {
  display: interFonts.semibold,
  displayLight: interFonts.regular,
  displayItalic: interFonts.medium,
  displayItalicSemi: interFonts.semibold,
  heading: interFonts.semibold,
  subheading: interFonts.medium,
  body: T.fontFamily.body,
  bodyLight: T.fontFamily.bodyLight,
  mono: T.fontFamily.mono,
} as const;
