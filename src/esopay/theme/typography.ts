import { colors } from '@/esopay/theme/colors';
import { fonts as interFonts } from '@/theme/fonts';

/** Eso Pay typography — Inter only (inherits global defaults). */
export const fonts = {
  display: interFonts.semibold,
  displayLight: interFonts.regular,
  displayItalic: interFonts.medium,
  displayItalicSemi: interFonts.semibold,
  ui: interFonts.regular,
  uiMedium: interFonts.medium,
  uiBold: interFonts.bold,
} as const;

export const typography = {
  greeting: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: colors.white,
  },
  greetingHome: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.4,
    color: colors.white,
  },
  heroBalance: {
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 55,
    letterSpacing: -0.5,
    color: colors.white,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
    color: colors.white,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 14,
    lineHeight: 23,
    color: colors.muted,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: colors.gold,
  },
  cta: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.gold,
  },
} as const;
