import { Platform, type ViewStyle } from 'react-native';

export const INVERTER_AUTH = {
  BG_PRIMARY: '#080D14',
  BG_SURFACE: '#0F1520',
  BG_ELEVATED: '#1A2035',
  BORDER_DEFAULT: '#1E2A3A',
  TEAL: '#00C48C',
  TEAL_GLOW: 'rgba(0,196,140,0.15)',
  GOLD: '#F5A623',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#8A94A6',
  TEXT_DISABLED: '#4A5568',
  ERROR: '#FF5C5C',
  ERROR_MISMATCH: '#FF6B6B',
  BUTTON_TEXT: '#080D14',
  INPUT_RADIUS: 12,
  BOX_RADIUS: 10,
} as const;

export const PRESS_SPRING = { damping: 18, stiffness: 300 } as const;

export function tealGlowStyle(): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: INVERTER_AUTH.TEAL,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    android: {
      elevation: 6,
      shadowColor: INVERTER_AUTH.TEAL,
    },
    default: {},
  }) as ViewStyle;
}
