/** Eso Pay Bills — ESO Energy palette (navy + gold). */
export const colors = {
  /** App canvas (replaces pure black). */
  black: '#0A0F1E',
  /** Main app card background (approx `#111827`). */
  surface: '#111827',
  surface2: '#0F172A',
  /** Primary accent (gold) — key kept for existing imports. */
  gold: '#D4A017',
  goldDim: '#A8891A',
  goldBright: '#FFD700',
  /** Payment pill CTAs — WCAG-friendly on `rgba(212, 160, 23, 0.16)` backgrounds. */
  goldAccent: '#FACC15',
  goldDark: '#B8860B',
  goldGlow: 'rgba(212, 160, 23, 0.12)',
  goldBorder: 'rgba(212, 160, 23, 0.22)',
  /** Fund Wallet CTA shadow — matches nav/title gold lift */
  fundWalletShadow: 'rgba(255, 200, 0, 0.35)',
  /** Status green (live/success only). */
  white: '#FFFFFF',
  muted: '#94A3B8',
  inactive: '#64748B',
  success: '#10B981',
  lime: '#10B981',
  limeGlow: 'rgba(16, 185, 129, 0.10)',
  limePillBg: 'rgba(16, 185, 129, 0.14)',
  limeBorder: 'rgba(16, 185, 129, 0.28)',
  limeBorderStrong: 'rgba(16, 185, 129, 0.38)',
  warning: '#F97316',
  danger: '#EF4444',
  navBg: 'rgba(10, 15, 30, 0.92)',
  navBorder: 'rgba(255,255,255,0.08)',
  navActivePill: 'rgba(212, 160, 23, 0.12)',
  walletGradientStart: '#0A0F1E',
  walletGradientEnd: '#111827',
} as const;

export type EsoPayColor = keyof typeof colors;
