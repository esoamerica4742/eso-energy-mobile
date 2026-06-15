/**
 * ESO Energy enterprise design tokens — semantic energy dashboard palette.
 * Metallic gold #C9A84C · Grid #3B82F6 · Battery #10B981 · Fault #EF4444 · Warning #F97316
 */

import { GOLD, GOLD_RGB } from '@/theme/colors';

/** Enterprise signature — metallic gold (solar, accents, active chrome). */
export const METALLIC_GOLD = GOLD;

const SOLAR = METALLIC_GOLD;
const GRID = '#3B82F6';
const BATTERY = '#10B981';
const FAULT = '#EF4444';
const WARNING = '#F97316';

export const Colors = {
  // Canvas (85% — deep charcoal + elevated panels)
  bg: '#020617',
  surface: '#0f172a',
  surfaceRaised: '#111827',
  surfaceNode: '#1e293b',
  surfaceCell: '#0f172a',

  // Solar generation (gold/amber) — also legacy `gold` alias
  solar: SOLAR,
  gold: SOLAR,
  metallicGold: METALLIC_GOLD,
  goldSoft: GOLD,
  goldMuted: GOLD,
  goldDim: GOLD,
  goldWhisper: `rgba(${GOLD_RGB},0.10)`,
  goldBorderStrong: `rgba(${GOLD_RGB},0.28)`,
  goldGlow: `rgba(${GOLD_RGB},0.06)`,
  goldBorder: `rgba(${GOLD_RGB},0.18)`,
  borderGold: `rgba(${GOLD_RGB},0.18)`,

  // Grid / home load (electric blue)
  grid: GRID,
  gridSoft: '#60A5FA',
  gridMuted: '#1D4ED8',
  gridWhisper: 'rgba(59,130,246,0.10)',
  gridBorder: 'rgba(59,130,246,0.24)',
  gridBorderStrong: 'rgba(59,130,246,0.38)',
  gridGlow: 'rgba(59,130,246,0.08)',

  // Battery & positive operational state (emerald)
  battery: BATTERY,
  mint: BATTERY,
  mintGlow: 'rgba(16,185,129,0.10)',
  mintBorder: 'rgba(16,185,129,0.28)',
  mintBorderStrong: 'rgba(16,185,129,0.38)',
  mintMuted: 'rgba(16,185,129,0.18)',
  batteryWhisper: 'rgba(16,185,129,0.10)',

  // Critical fault / offline (red — never gold)
  fault: FAULT,
  alert: FAULT,
  alertMuted: 'rgba(239,68,68,0.12)',
  alertBorder: 'rgba(239,68,68,0.28)',

  // System warnings / stale / threshold (orange)
  warning: WARNING,
  warningMuted: 'rgba(249,115,22,0.12)',
  warningBorder: 'rgba(249,115,22,0.28)',
  warningWhisper: 'rgba(249,115,22,0.10)',

  // Pending / awaiting telemetry placeholders
  pendingValue: '#8B5E2A',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  white: '#FFFFFF',

  // Structure
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderCard: 'rgba(255,255,255,0.05)',
  cellBorder: 'rgba(255,255,255,0.08)',
};

export const FontSize = {
  micro: 9,
  label: 10,
  caption: 12,
  body: 13,
  sub: 15,
  title: 26,
  unit: 22,
  metric: 44,
  hero: 52,
};

export const FontWeight = {
  thin: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Shared rhythm for inverter monitoring scroll + card stacks */
export const MonitoringLayout = {
  scrollGap: 20,
  sectionGap: 12,
  cardGap: 12,
  cardMarginH: 16,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 100,
};

export const Shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  cell: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  goldGlow: {
    shadowColor: SOLAR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  gridGlow: {
    shadowColor: GRID,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  alertGlow: {
    shadowColor: FAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  mintGlow: {
    shadowColor: BATTERY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
};

export const ChartColors = {
  power: SOLAR,
  solar: SOLAR,
  load: GRID,
  battery: BATTERY,
  powerFill: `rgba(${GOLD_RGB},0.08)`,
  solarFill: `rgba(${GOLD_RGB},0.08)`,
  loadFill: 'rgba(59,130,246,0.08)',
  batteryFill: 'rgba(16,185,129,0.08)',
  chartBg: Colors.surfaceCell,
  gridLine: 'rgba(255,255,255,0.06)',
  axisLabel: Colors.textMuted,
  axisLine: 'rgba(255,255,255,0.08)',
};

export const ChartMetrics = {
  lineWidth: 2,
  lineGlowWidth: 6,
  lineGlowOpacity: 0.25,
  endDotSize: 8,
  endDotBorder: 2,
  yAxisWidth: 52,
  xAxisHeight: 28,
  gridLineCount: 4,
  chartPadding: {
    top: 16,
    right: 16,
    bottom: 0,
    left: 0,
  },
};
