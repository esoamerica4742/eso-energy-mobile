import { Platform } from 'react-native';
import { GOLD } from '@/theme/colors';

export const ACCESS_THEME = {
  bg: '#08080D',
  card: '#0F0F1A',
  gold: GOLD,
  goldDim: GOLD,
  white: '#F7F4EE',
  body: '#A0A0A0',
  border: 'rgba(201,168,76,0.12)',
  borderCardMonitoring: 'rgba(201,168,76,0.18)',
  borderCardEsoPay: 'rgba(201,168,76,0.11)',
  iconTintMonitoring: 'rgba(201,168,76,0.14)',
  iconTintEsoPay: 'rgba(201,168,76,0.08)',
  accentBar: GOLD,
  accentBarFade: 'rgba(201,168,76,0.35)',
  ctaPress: 'rgba(201,168,76,0.06)',
  divider: 'rgba(201,168,76,0.08)',
} as const;

export const ACCESS_FONTS = {
  display: 'Inter_700Bold',
  headline: 'Inter_600SemiBold',
  headlineItalic: 'Inter_500Medium',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiBold: 'Inter_700Bold',
} as const;

export const ACCESS_LAYOUT = {
  maxContentWidth: 430,
  horizontalPad: 24,
  /** Extra space below safe-area top (SafeAreaView applies insets.top). */
  headerTopExtra: Platform.OS === 'web' ? 16 : 8,
  signInBottomExtra: 32,
  signInDockTop: 28,
} as const;

export const CARD_VARIANT_THEME = {
  monitoring: {
    borderColor: ACCESS_THEME.borderCardMonitoring,
    iconTint: ACCESS_THEME.iconTintMonitoring,
  },
  esopay: {
    borderColor: ACCESS_THEME.borderCardEsoPay,
    iconTint: ACCESS_THEME.iconTintEsoPay,
  },
} as const;
