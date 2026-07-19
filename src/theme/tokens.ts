/**
 * ESO Energy design tokens — quiet black/white monitoring dialect.
 * Single source of truth. Zero hardcoded values in components.
 */

import { fonts as interFonts } from '@/theme/fonts';

// ─── Quiet chrome (white / black dialect) ────────────────────────────────────
export const gold = {
  /** Primary chrome accent — white */
  g400: '#FFFFFF',
  /** Brighter highlight — hover / active states */
  g300: '#FFFFFF',
  /** Muted — secondary accent text */
  g600: 'rgba(255,255,255,0.55)',
  /** Very subtle white fill */
  bg: 'rgba(255,255,255,0.06)',
  /** Thin white border */
  border: 'rgba(255,255,255,0.14)',
  /** Strong white border */
  borderStrong: 'rgba(255,255,255,0.28)',
};

// ─── Semantic monitoring palette (aligned with src/tokens/design.ts) ─────────
export const colors = {
  bgBase: '#000000',
  bgSurface: '#1C1C1E',
  bgElevated: '#2C2C2E',
  bgHighlit: '#2C2C2E',

  borderSubtle: '#2C2C2E',
  borderDefault: '#3A3A3C',

  gold: '#FFFFFF',
  goldBright: '#FFFFFF',
  goldMuted: 'rgba(255,255,255,0.55)',
  goldBg: 'rgba(255,255,255,0.08)',
  goldBorder: 'rgba(255,255,255,0.12)',
  goldBorderStrong: 'rgba(255,255,255,0.22)',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.84)',
  textTertiary: 'rgba(255, 255, 255, 0.68)',
  textAccent: '#FFFFFF',

  pressedRow: '#1C1C1E',

  solarBg: 'rgba(255,255,255,0.08)',
  solarText: '#FFFFFF',
  solarDot: '#FFFFFF',
  solarBorder: 'rgba(255,255,255,0.16)',

  gridBg: 'rgba(59,130,246,0.10)',
  gridText: '#3B82F6',
  gridDot: '#3B82F6',
  gridBorder: 'rgba(59,130,246,0.28)',

  dieselBg: 'rgba(249,115,22,0.10)',
  dieselText: '#F97316',
  dieselDot: '#F97316',
  dieselBorder: 'rgba(249,115,22,0.28)',

  offlineBg: 'rgba(239,68,68,0.12)',
  offlineText: '#EF4444',
  offlineDot: '#EF4444',
  offlineBorder: 'rgba(239,68,68,0.28)',

  warningBg: 'rgba(249,115,22,0.12)',
  warningText: '#F97316',
  warningDot: '#F97316',
  warningBorder: 'rgba(249,115,22,0.28)',

  positiveBg: 'rgba(16,185,129,0.10)',
  positiveText: '#10B981',
  negativeBg: 'rgba(239,68,68,0.12)',
  negativeText: '#EF4444',
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
  xxxl: 40,
};

// ─── Radius ───────────────────────────────────────────────────────────────────
export const radius = {
  badge: 10,
  button: 12,
  card: 20,
  cardLg: 24,
  pill: 50,
  sheet: 20,
};

// ─── Font sizes ───────────────────────────────────────────────────────────────
export const fontSize = {
  micro: 9,
  label: 11,
  badge: 12,
  body: 13,
  value: 15,
  title: 18,
  xl: 22,
  hero: 32,
  display: 44,
};

// ─── Font families (Inter — see src/theme/fonts.ts) ─────────────────────────
export const fonts = interFonts;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadowCard = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.22,
  shadowRadius: 18,
  elevation: 6,
};

export const shadowGold = {
  shadowColor: '#FFFFFF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 0,
};

export const shadowFlat = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.14,
  shadowRadius: 6,
  elevation: 2,
};

export const shadowNone = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};
