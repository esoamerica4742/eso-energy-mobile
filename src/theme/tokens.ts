/**
 * ESO Energy design tokens — gold standard edition.
 * Single source of truth. Zero hardcoded values in components.
 */

import { METALLIC_GOLD } from '@/tokens/design';
import { fonts as interFonts } from '@/theme/fonts';

const GOLD_RGB = '212, 175, 55';

// ─── Gold palette ────────────────────────────────────────────────────────────
export const gold = {
  /** Primary signature — metallic gold */
  g400: METALLIC_GOLD,
  /** Brighter highlight — hover / active states */
  g300: '#E8D5A3',
  /** Muted — secondary gold text */
  g600: '#A68B2E',
  /** Very subtle gold fill */
  bg: `rgba(${GOLD_RGB}, 0.06)`,
  /** Thin gold border */
  border: `rgba(${GOLD_RGB}, 0.18)`,
  /** Strong gold border */
  borderStrong: `rgba(${GOLD_RGB}, 0.35)`,
};

// ─── Semantic monitoring palette (aligned with src/tokens/design.ts) ─────────
export const colors = {
  bgBase: '#020617',
  bgSurface: '#0f172a',
  bgElevated: '#111827',
  bgHighlit: '#1e293b',

  borderSubtle: '#1e293b',
  borderDefault: '#334155',

  gold: METALLIC_GOLD,
  goldBright: '#E8D5A3',
  goldMuted: '#A68B2E',
  goldBg: `rgba(${GOLD_RGB},0.10)`,
  goldBorder: `rgba(${GOLD_RGB},0.18)`,
  goldBorderStrong: `rgba(${GOLD_RGB},0.28)`,

  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textAccent: METALLIC_GOLD,

  pressedRow: '#1e293b',

  solarBg: `rgba(${GOLD_RGB},0.10)`,
  solarText: METALLIC_GOLD,
  solarDot: METALLIC_GOLD,
  solarBorder: `rgba(${GOLD_RGB},0.28)`,

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
  xl: 16,
  xxl: 28,
  xxxl: 40,
};

// ─── Radius ───────────────────────────────────────────────────────────────────
export const radius = {
  badge: 10,
  button: 10,
  card: 16,
  cardLg: 16,
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
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 6,
};

export const shadowGold = {
  shadowColor: gold.g400,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 0,
};

export const shadowFlat = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.18,
  shadowRadius: 3,
  elevation: 2,
};

export const shadowNone = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};
