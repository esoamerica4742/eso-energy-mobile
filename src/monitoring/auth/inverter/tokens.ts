import { Platform, type ViewStyle } from 'react-native';

/** Monitoring auth — quiet black / white (matches MasterAuthChrome). */
export const INVERTER_AUTH = {
  BG_PRIMARY: '#000000',
  BG_SURFACE: '#1C1C1E',
  BG_ELEVATED: '#2C2C2E',
  BORDER_DEFAULT: '#2C2C2E',
  /** Legacy name — white chrome accent. */
  TEAL: '#FFFFFF',
  TEAL_GLOW: 'rgba(255,255,255,0.08)',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255,255,255,0.55)',
  TEXT_DISABLED: 'rgba(255,255,255,0.28)',
  ERROR: '#FF5C5C',
  ERROR_MISMATCH: '#FF6B6B',
  BUTTON_TEXT: '#000000',
  INPUT_RADIUS: 12,
  BOX_RADIUS: 10,
} as const;

export const PRESS_SPRING = { damping: 18, stiffness: 300 } as const;

export function tealGlowStyle(): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
      shadowColor: '#FFFFFF',
    },
    default: {},
  }) as ViewStyle;
}
