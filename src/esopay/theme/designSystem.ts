/**
 * Eso Pay global design system — quiet Revolut dialect.
 * Inter only · pure black · white chrome.
 */
import { ECO_MOTION } from '@/theme/ecosystem';
import { inter } from '@/theme/fonts';

export const ESO_PAY_CANVAS_BG = '#000000' as const;
/** White chrome — never import theme GOLD here (Hermes crash if unbound). */
const CHROME = '#FFFFFF' as const;

export const ds = {
  color: {
    bg: ESO_PAY_CANVAS_BG,
    surface1: '#1C1C1E',
    surface2: '#2C2C2E',
    surface3: '#3A3A3C',
    border: '#2C2C2E',
    borderSubtle: '#3A3A3C',
    borderActive: 'rgba(255,255,255,0.35)',
    /** Primary CTA fill — white chrome (legacy name kept). */
    gold: CHROME,
    goldDim: 'rgba(255,255,255,0.35)',
    /** Legacy alias — white chrome. */
    teal: CHROME,
    error: '#FF6B6B',
    warning: '#F59E0B',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.55)',
    textMuted: 'rgba(255,255,255,0.45)',
    textDisabled: 'rgba(255,255,255,0.28)',
    textPlaceholder: 'rgba(255,255,255,0.28)',
    display: '#FFFFFF',
    navBg: 'rgba(0, 0, 0, 0.88)',
    overlay: 'rgba(0,0,0,0.72)',
    shadow: 'rgba(0,0,0,0.5)',
    tealMuted: 'rgba(255, 255, 255, 0.08)',
    goldMuted12: 'rgba(255, 255, 255, 0.12)',
    goldMuted20: 'rgba(255, 255, 255, 0.16)',
    goldMuted35: 'rgba(255, 255, 255, 0.28)',
    goldMuted08: 'rgba(255, 255, 255, 0.08)',
    goldMuted04: 'rgba(255, 255, 255, 0.04)',
    errorMuted: 'rgba(255,107,107,0.12)',
    warningMuted: 'rgba(245,158,11,0.1)',
  },
  font: {
    display: inter.bold,
    headline: inter.bold,
    title: inter.semibold,
    subtitle: inter.semibold,
    body: inter.regular,
    bodyStrong: inter.medium,
    label: inter.medium,
    caption: inter.regular,
    amount: inter.bold,
    button: inter.semibold,
  },
  type: {
    display: { fontSize: 40, lineHeight: 46, letterSpacing: -1 },
    headline: { fontSize: 28, lineHeight: 34 },
    title: { fontSize: 18, lineHeight: 24 },
    subtitle: { fontSize: 16, lineHeight: 22 },
    body: { fontSize: 17, lineHeight: 25 },
    label: { fontSize: 13, lineHeight: 18 },
    caption: { fontSize: 12, lineHeight: 16 },
    section: { fontSize: 13, lineHeight: 18, letterSpacing: 2 },
    /** Hero / pass balance — the number is the product. */
    amount: { fontSize: 44, lineHeight: 50, letterSpacing: -1.6 },
    button: { fontSize: 16, lineHeight: 22, letterSpacing: 0.3 },
    nav: { fontSize: 10, lineHeight: 13, letterSpacing: 0.4 },
    chip: { fontSize: 11, lineHeight: 14 },
  },
  radius: {
    chip: 10,
    input: 14,
    card: 22,
    wallet: 28,
    modal: 24,
    pill: 999,
    otp: 12,
    nav: 28,
  },
  space: {
    screen: 20,
    section: 28,
    component: 16,
    inline: 8,
  },
  size: {
    buttonHeight: 54,
    ghostHeight: 52,
    inputHeight: 56,
    otpBox: 56,
    iconDefault: 20,
    iconFeature: 24,
    navIcon: 22,
    sectionAccent: 3,
  },
  motion: {
    duration: ECO_MOTION.duration,
    spring: ECO_MOTION.spring,
  },
} as const;
