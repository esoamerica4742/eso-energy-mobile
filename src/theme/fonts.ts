import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/** Expo Google Fonts postscript names — single source of truth for Inter. */
export const inter = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Alias used across monitoring dashboards and shared components. */
export const fonts = {
  regular: inter.regular,
  medium: inter.medium,
  semibold: inter.semibold,
  bold: inter.bold,
  /** Large metrics / hero numbers */
  display: inter.semibold,
  displayItalic: inter.semibold,
} as const;

export const INTER_FONT_MAP = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} as const;
