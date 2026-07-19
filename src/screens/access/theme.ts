import { inter } from '@/theme/fonts';
import type { PlatformCardVariant } from '@/screens/access/types';

/** Quiet Revolut dialect — command center / access picker. */
export const ACCESS_THEME = {
  bg: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  white: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
  body: 'rgba(255,255,255,0.55)',
  border: 'rgba(255,255,255,0.14)',
  divider: 'rgba(255,255,255,0.1)',
  accentBar: 'rgba(255,255,255,0.35)',
  accentBarFade: 'rgba(255,255,255,0.08)',
  gold: '#FFFFFF',
  goldDim: 'rgba(255,255,255,0.35)',
  ctaPress: 'rgba(255,255,255,0.06)',
} as const;

export const ACCESS_FONTS = {
  title: inter.semibold,
  body: inter.regular,
  meta: inter.medium,
  display: inter.semibold,
  ui: inter.regular,
  uiBold: inter.semibold,
} as const;

export const ACCESS_LAYOUT = {
  signInDockTop: 16,
} as const;

export const CARD_VARIANT_THEME: Record<
  PlatformCardVariant,
  {
    borderColor: string;
    iconTint: string;
    iconContainerBg: string;
    iconColor: string;
    metadataColor: string;
    chevronColor: string;
  }
> = {
  monitoring: {
    borderColor: 'rgba(255,255,255,0.14)',
    iconTint: 'rgba(255,255,255,0.1)',
    iconContainerBg: 'rgba(255,255,255,0.08)',
    iconColor: '#FFFFFF',
    metadataColor: 'rgba(255,255,255,0.55)',
    chevronColor: 'rgba(255,255,255,0.7)',
  },
  esopay: {
    borderColor: 'rgba(255,255,255,0.12)',
    iconTint: 'rgba(255,255,255,0.08)',
    iconContainerBg: 'rgba(255,255,255,0.06)',
    iconColor: '#FFFFFF',
    metadataColor: 'rgba(255,255,255,0.5)',
    chevronColor: 'rgba(255,255,255,0.65)',
  },
};
