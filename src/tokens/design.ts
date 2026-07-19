/**
 * ESO Energy enterprise design tokens — semantic energy dashboard palette.
 * Monitoring accent · Teal #00C896 · Grid #3B82F6 · Battery #10B981 · Fault #EF4444 · Warning #F97316
 */

import { GOLD } from '@/theme/colors';

/** Polished monitoring teal — primary accent across inverter monitoring UI. */
export const MONITORING_TEAL = '#00C896';
export const MONITORING_TEAL_RGB = '0, 200, 150';
export const MONITORING_TEAL_SOFT = '#5EEAD4';
export const MONITORING_TEAL_DIM = '#0F9B7A';

export const monitoringTealAlpha = (alpha: number) => `rgba(${MONITORING_TEAL_RGB},${alpha})`;

/** Landing / legacy gold — not used for monitoring chrome (see Colors.gold → teal). */
export const METALLIC_GOLD = GOLD;

const ACCENT = MONITORING_TEAL;
const ACCENT_RGB = MONITORING_TEAL_RGB;
const GRID = '#3B82F6';
const BATTERY = '#10B981';
const FAULT = '#EF4444';
const WARNING = '#F97316';

export const Colors = {
  // Canvas — quiet black dialect (aligned with auth / Eso Pay)
  bg: '#000000',
  surface: '#1C1C1E',
  surfaceRaised: '#2C2C2E',
  surfaceNode: '#2C2C2E',
  surfaceCell: '#1C1C1E',

  // Chrome accent — white (operational teal kept for telemetry semantics below)
  solar: '#FFFFFF',
  gold: '#FFFFFF',
  teal: ACCENT,
  metallicGold: '#FFFFFF',
  goldSoft: 'rgba(255,255,255,0.72)',
  goldMuted: 'rgba(255,255,255,0.45)',
  goldDim: 'rgba(255,255,255,0.35)',
  goldWhisper: 'rgba(255,255,255,0.08)',
  goldBorderStrong: 'rgba(255,255,255,0.28)',
  goldGlow: 'rgba(255,255,255,0.04)',
  goldBorder: 'rgba(255,255,255,0.12)',
  borderGold: 'rgba(255,255,255,0.12)',
  tealWhisper: 'rgba(255,255,255,0.06)',
  tealBorder: 'rgba(255,255,255,0.12)',
  tealBorderStrong: 'rgba(255,255,255,0.22)',
  tealGlow: 'rgba(255,255,255,0.04)',

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
  pendingValue: '#3D6B62',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.84)',
  textMuted: 'rgba(255, 255, 255, 0.68)',
  white: '#FFFFFF',

  // Structure
  borderSubtle: 'rgba(255,255,255,0.07)',
  borderCard: 'rgba(255,255,255,0.075)',
  cellBorder: 'rgba(255,255,255,0.10)',
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
  md: 16,
  lg: 22,
  xl: 26,
  pill: 100,
};

export const Shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.34,
    shadowRadius: 24,
    elevation: 10,
  },
  cell: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 6,
  },
  goldGlow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tealGlow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridGlow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  alertGlow: {
    shadowColor: FAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  mintGlow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
};

export const ChartColors = {
  power: '#FFFFFF',
  solar: 'rgba(255,255,255,0.85)',
  load: 'rgba(255,255,255,0.55)',
  battery: BATTERY,
  powerFill: 'rgba(255,255,255,0.08)',
  solarFill: 'rgba(255,255,255,0.06)',
  loadFill: 'rgba(255,255,255,0.04)',
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
