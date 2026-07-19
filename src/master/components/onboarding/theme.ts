export const OB = {
  bg: '#000000',
  bgMid: '#05080F',
  bgDeep: '#000000',
  surface: '#1C1C1E',
  surfaceRaised: '#1C1C1E',
  surfaceGlass: 'rgba(28, 28, 30, 0.76)',
  surfaceCard: 'rgba(28, 28, 30, 0.92)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  /** Chrome accent — white (legacy name kept for call sites). */
  gold: '#FFFFFF',
  goldLight: '#FFFFFF',
  goldDark: 'rgba(255,255,255,0.72)',
  goldDim: 'rgba(255, 255, 255, 0.08)',
  goldBorder: 'rgba(255, 255, 255, 0.22)',
  goldGlow: 'rgba(255, 255, 255, 0.1)',
  mint: '#FFFFFF',
  mintDim: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.72)',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  textLabel: 'rgba(255, 255, 255, 0.55)',
  error: '#FF6B6B',
  ink: '#000000',
} as const;

/** Strict 8-point spacing grid for onboarding. */
export const OB_SPACE = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

/** Coherent type scale — onboarding + auth. */
export const OB_TYPE = {
  hero: { fontSize: 35, lineHeight: 44, letterSpacing: -0.28 },
  heroCompact: { fontSize: 31, lineHeight: 39, letterSpacing: -0.18 },
  heroMicro: { fontSize: 29, lineHeight: 37, letterSpacing: -0.12 },
  display: { fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  titleSm: { fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontSize: 17, lineHeight: 25 },
  bodySm: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  caption: { fontSize: 11, lineHeight: 16, letterSpacing: 0.25 },
  micro: { fontSize: 10, lineHeight: 14, letterSpacing: 0.3 },
} as const;

export const OB_RADIUS = {
  card: 24,
  button: 14,
  icon: 12,
  pill: 100,
} as const;

/** Welcome landing screen spacing rhythm (8pt grid). */
export const OB_LANDING = {
  section: OB_SPACE.md,
  /** Space between headline and subtitle. */
  heroLead: 12,
  /** Space below subtitle before module cards. */
  subtitleBottom: OB_SPACE.md + 12,
  /** Breathing room above security banner. */
  trustTop: 8,
  block: OB_SPACE.sm,
  /** Space between primary CTA and sign-in link. */
  signInTop: 18,
  /** Landing module cards — equal height, full description visibility. */
  cardHeight: 192,
  hubCardHeight: 220,
  /** Command center picker — room for full title + body in side-by-side layout. */
  commandCardHeight: 236,
  /** Create Account CTA — compact hero control. */
  heroButtonMinHeight: 50,
  heroButtonPaddingV: 15,
  /** Auth form primary CTA — ~15% shorter than default Continue. */
  authButtonPaddingV: Math.round(17 * 0.85),
  /** Register screen CTA — 5% shorter than compact auth button. */
  registerButtonPaddingV: Math.round(Math.round(17 * 0.85) * 0.95),
} as const;
