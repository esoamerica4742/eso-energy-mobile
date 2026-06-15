/** Solar Gold — sole accent across Eso Pay. */
export const ESO_PAY_GOLD = '#E6A11A';
export const ESO_PAY_GOLD_DIM = '#8A6F32';

export const ESO_PAY_GOLD_MUTED = 'rgba(230, 161, 26, 0.1)';
export const ESO_PAY_GOLD_MUTED_06 = 'rgba(230, 161, 26, 0.06)';
export const ESO_PAY_GOLD_MUTED_15 = 'rgba(230, 161, 26, 0.15)';
export const ESO_PAY_GOLD_MUTED_20 = 'rgba(230, 161, 26, 0.2)';
export const ESO_PAY_GOLD_MUTED_35 = 'rgba(230, 161, 26, 0.35)';

/** Deep Navy Black canvas. */
export const ESO_PAY_BG = '#020B1A';
export const ESO_PAY_SURFACE = '#0D1018';
/** Wallet & elevated cards — slightly lighter than canvas. */
export const ESO_PAY_SURFACE_ELEVATED = '#111827';
export const ESO_PAY_BORDER = '#1C2030';
export const ESO_PAY_BORDER_SUBTLE = '#2A3040';

export const ESO_PAY_TEXT_PRIMARY = '#F5F0E8';
export const ESO_PAY_TEXT_SECONDARY = '#9CA3AF';
export const ESO_PAY_ERROR = '#FF5C5C';

export const NAV_GOLD = ESO_PAY_GOLD;
export const TEAL_ACCENT = ESO_PAY_GOLD;
export const SECONDARY_LINK_COLOR = ESO_PAY_GOLD;
export const WARM_WHITE = ESO_PAY_TEXT_PRIMARY;

export const GOLD_CTA = ESO_PAY_GOLD;

export const HOME_CARD_SURFACE = ESO_PAY_SURFACE;
export const HOME_CARD_BORDER = ESO_PAY_BORDER;
export const HOME_WALLET_SURFACE = ESO_PAY_SURFACE_ELEVATED;
export const HOME_WALLET_BORDER = ESO_PAY_GOLD;
export const HOME_TEXT_MUTED = ESO_PAY_TEXT_SECONDARY;

export const NAV_BAR_BG = 'rgba(2, 11, 26, 0.88)';
export const NAV_BAR_BORDER = 'rgba(230, 161, 26, 0.12)';
export const NAV_INACTIVE = '#6B7280';

export const WALLET_CARD_SURFACE = HOME_WALLET_SURFACE;

/** Ambient gold wash — wallet hero only (not a shadow). */
export const ESO_PAY_GOLD_AMBIENT = 'rgba(211, 153, 26, 0.04)' as const;

/** Apple Wallet–style soft elevation. */
export const WALLET_CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.32,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
} as const;

/** Premium card elevation — services & transactions. */
export const PREMIUM_CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.35,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
} as const;

/** @deprecated Use WALLET_CARD_SHADOW */
export const ESO_PAY_GOLD_SHADOW = WALLET_CARD_SHADOW;
