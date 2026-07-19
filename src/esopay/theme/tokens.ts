import type { ViewStyle } from 'react-native';
import { ESO_PAY_GOLD } from '@/esopay/theme/brandColors';

/**
 * Eso Pay design tokens — single source of truth (spec v1.0.0 §1.2–1.6).
 * Import as: `import { EsoPayTokens as T } from '@/esopay/theme/tokens'`
 */

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const EsoPayTokensRaw = {
  color: {
    bg: {
      void: '#000000',
      surface: '#1C1C1E',
      elevated: '#2C2C2E',
      inset: '#111111',
    },
    gold: {
      /** Aligned to brand ESO_PAY_GOLD — white chrome. */
      primary: ESO_PAY_GOLD,
      shimmer: 'rgba(255,255,255,0.85)',
      muted: 'rgba(255,255,255,0.35)',
    },
    emerald: {
      live: '#10B981',
      dim: '#059669',
    },
    red: {
      alert: '#E53E3E',
      dim: '#8B1A28',
    },
    amber: {
      partial: '#F97316',
    },
    platinum: {
      paid: '#C8D0E0',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.84)',
      disabled: '#64748B',
    },
    border: {
      subtle: 'rgba(255,255,255,0.06)',
      active: 'rgba(255,255,255,0.35)',
    },
  },

  fontFamily: {
    display: 'Inter_600SemiBold',
    heading: 'Inter_700Bold',
    subheading: 'Inter_500Medium',
    body: 'Inter_400Regular',
    bodyLight: 'Inter_400Regular',
    mono: 'Inter_400Regular',
  },

  type: {
    hero: { size: 48, lineHeight: 52, letterSpacing: -1.5 },
    display: { size: 36, lineHeight: 40, letterSpacing: -1.0 },
    h1: { size: 24, lineHeight: 30, letterSpacing: -0.5 },
    h2: { size: 18, lineHeight: 24, letterSpacing: -0.25 },
    h3: { size: 15, lineHeight: 20, letterSpacing: 0 },
    body: { size: 14, lineHeight: 22, letterSpacing: 0 },
    label: { size: 12, lineHeight: 16, letterSpacing: 0.5 },
    caption: { size: 11, lineHeight: 15, letterSpacing: 0.75 },
    mono: { size: 13, lineHeight: 18, letterSpacing: 0 },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
    '7xl': 80,
  },

  layout: {
    gridUnit: 4,
    screenMargin: 20,
    screenMarginNarrow: 16,
    narrowBreakpoint: 375,
    cardPaddingHorizontal: 16,
    cardPaddingVertical: 20,
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    full: 9999,
  },

  icon: {
    inline: 20,
    cardAction: 24,
    feature: 32,
    emptyState: 48,
  },

  shadow: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    } satisfies ShadowStyle,
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
      elevation: 12,
    } satisfies ShadowStyle,
    inputFocus: {
      shadowColor: ESO_PAY_GOLD,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    } satisfies ShadowStyle,
  },

  animation: {
    shimmerDurationMs: 3000,
    pulsePeriodMs: 1800,
    staggerStepMs: 60,
    numberTickerDurationMs: 1200,
    cardEntrance: {
      initialScale: 0.97,
      spring: { damping: 18, stiffness: 200 },
    },
    bottomSheet: {
      snapPoints: ['50%', '90%'] as const,
      backdropBlurIntensity: 20,
      dragIndicatorWidth: 36,
      dragIndicatorHeight: 4,
      spring: { damping: 22, stiffness: 280 },
    },
    haptic: {
      paymentSuccessDelayMs: 120,
      errorIntervalMs: 80,
      errorPulseCount: 3,
    },
  },

  status: {
    live: '#34D399',
    partial: '#F0A500',
    offline: '#FF3B55',
    paid: '#C8D0E0',
  },
} as const;

export type EsoPayTokensType = DeepReadonly<typeof EsoPayTokensRaw>;

/** Frozen token tree — all Eso Pay UI values must reference this object. */
export const EsoPayTokens: EsoPayTokensType = EsoPayTokensRaw;

/** Semantic status colors for bill / inverter offset badges (spec §1.2 micro-indicators). */
export type EsoPayStatusKey = keyof typeof EsoPayTokensRaw.status;

export function esopayStatusColor(status: EsoPayStatusKey): string {
  return EsoPayTokens.status[status];
}
