/** Eso Pay Bills — aligned to ESO Energy main app. */
export const luxury = {
  bg: '#0A0F1E',
  surface: '#111827',
  surface2: '#0F172A',
  /** Accent (gold) — `gold` alias for legacy component props. */
  gold: '#D4A017',
  /** Vibrant CTA label on dark gold pills (nav-active / high-contrast accent). */
  goldAccent: '#FACC15',
  goldDim: 'rgba(212, 160, 23, 0.14)',
  goldBorder: 'rgba(255,255,255,0.08)',
  goldGlow: 'rgba(212, 160, 23, 0.18)',
  textPrimary: '#FFFFFF',
  /** Soft section headers + outline pill labels on dark surfaces. */
  warmWhite: '#F4F4F6',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  /** Keep green only for status (LIVE/ACTIVE/success). */
  green: '#10B981',
  walletGradient: ['#0A0F1E', '#111827'] as const,
  glass: 'rgba(212, 160, 23, 0.05)',
} as const;
