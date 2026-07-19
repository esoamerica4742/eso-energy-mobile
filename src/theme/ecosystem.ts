/**
 * ESO Energy ecosystem refinement tokens — shared across Monitoring, ESO Pay, and Master auth.
 * Refinement pass: reduced glow, higher text contrast, 8pt grid, unified card language.
 */

/** Reduce glow ~25% — max bloom 8–12px */
export const ECO_GLOW = {
  goldOpacity: 0.095,
  goldRadius: 9,
  mintOpacity: 0.022,
  goldAmbient: 0.028,
  goldAmbientSoft: 0.018,
  iconHaloOpacity: 0.2,
  iconHaloRadius: 7,
} as const;

/** Text contrast on dark canvas */
export const ECO_TEXT = {
  primary: '#FFFFFF',
  secondary: 'rgba(255, 255, 255, 0.84)',
  label: 'rgba(255, 255, 255, 0.84)',
  muted: 'rgba(255, 255, 255, 0.58)',
} as const;

/** Strict typography rhythm */
export const ECO_TYPE = {
  hero: { fontSize: 52, lineHeight: 58, letterSpacing: -1.1 },
  screenTitle: { fontSize: 42, lineHeight: 48, letterSpacing: -0.9 },
  sectionTitle: { fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  cardTitle: { fontSize: 22, lineHeight: 28, letterSpacing: -0.25 },
  body: { fontSize: 17, lineHeight: 25 },
  bodySm: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
} as const;

/** 8pt spacing grid */
export const ECO_SPACE = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

/** Unified card language — Monitoring + ESO Pay */
export const ECO_CARD = {
  radius: 22,
  border: 'rgba(255, 255, 255, 0.10)',
  surface: 'rgba(14, 18, 28, 0.94)',
  padding: 16,
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
} as const;

/** Motion system — 200–250ms + spring */
export const ECO_MOTION = {
  duration: 220,
  durationSlow: 250,
  spring: { damping: 20, stiffness: 280, mass: 0.85 },
  springSnappy: { damping: 18, stiffness: 340, mass: 0.65 },
} as const;

/** Physical gold button treatment */
export const ECO_BUTTON = {
  bottomEdge: 'rgba(0, 0, 0, 0.22)',
  sheen: 'rgba(255, 255, 255, 0.09)',
  topHighlight: 'rgba(255, 255, 255, 0.34)',
  goldShadowOpacity: 0.14,
  goldShadowRadius: 12,
} as const;
