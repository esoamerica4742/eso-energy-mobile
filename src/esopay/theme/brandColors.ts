/** Legacy accent token — white chrome on quiet surfaces. */
export const ESO_PAY_GOLD = '#FFFFFF';
export const ESO_PAY_GOLD_DIM = 'rgba(255,255,255,0.35)';

export const ESO_PAY_GOLD_MUTED = 'rgba(255, 255, 255, 0.08)';
export const ESO_PAY_GOLD_MUTED_06 = 'rgba(255, 255, 255, 0.06)';
export const ESO_PAY_GOLD_MUTED_15 = 'rgba(255, 255, 255, 0.12)';
export const ESO_PAY_GOLD_MUTED_20 = 'rgba(255, 255, 255, 0.16)';
export const ESO_PAY_GOLD_MUTED_35 = 'rgba(255, 255, 255, 0.28)';

/** Pure black canvas — matches master auth dialect. */
export const ESO_PAY_BG = '#000000';
export const ESO_PAY_SURFACE = '#1C1C1E';
/** Wallet & elevated cards — slightly lighter than canvas. */
export const ESO_PAY_SURFACE_ELEVATED = '#2C2C2E';
export const ESO_PAY_BORDER = '#2C2C2E';
export const ESO_PAY_BORDER_SUBTLE = '#3A3A3C';

export const ESO_PAY_TEXT_PRIMARY = '#FFFFFF';
export const ESO_PAY_TEXT_SECONDARY = 'rgba(255, 255, 255, 0.55)';
/** Bill card helper lines — secondary on dark surfaces. */
export const ESO_PAY_CARD_HINT = 'rgba(255, 255, 255, 0.55)';
export const ESO_PAY_ERROR = '#FF6B6B';

export const NAV_GOLD = ESO_PAY_GOLD;
export const TEAL_ACCENT = ESO_PAY_GOLD;
export const SECONDARY_LINK_COLOR = ESO_PAY_GOLD;
export const WARM_WHITE = ESO_PAY_TEXT_PRIMARY;

export const GOLD_CTA = ESO_PAY_GOLD;

export const HOME_CARD_SURFACE = ESO_PAY_SURFACE;
export const HOME_CARD_BORDER = ESO_PAY_BORDER;
/** Service bill cards — quiet dark surfaces. */
export const BILL_CARD_GRADIENT_TOP = '#2C2C2E';
export const BILL_CARD_GRADIENT_BOTTOM = '#1C1C1E';
/** Soft top highlight wash on bill card gradients. */
export const BILL_CARD_SHEEN_TOP = 'rgba(255, 255, 255, 0.12)';
export const BILL_CARD_SHEEN_MID = 'rgba(255, 255, 255, 0.04)';
/** Wallet pass — quiet elevated surface. */
export const WALLET_CARD_GRADIENT_TOP = '#2C2C2E';
export const WALLET_CARD_GRADIENT_BOTTOM = '#1C1C1E';
export const BILL_CARD_SURFACE = '#2C2C2E';
export const BILL_CARD_SURFACE_PRESSED = '#3A3A3C';
export const BILL_CARD_BORDER = 'rgba(255, 255, 255, 0.12)';
export const BILL_CARD_BORDER_GOLD = 'rgba(255, 255, 255, 0.18)';
export const HOME_WALLET_SURFACE = ESO_PAY_SURFACE_ELEVATED;
export const HOME_WALLET_BORDER = 'rgba(255, 255, 255, 0.12)';
export const HOME_TEXT_MUTED = ESO_PAY_TEXT_SECONDARY;

export const NAV_BAR_BG = 'rgba(0, 0, 0, 0.88)';
export const NAV_BAR_BORDER = 'rgba(255, 255, 255, 0.12)';
/** Inactive tab icons — quiet silver on black glass. */
export const NAV_INACTIVE = 'rgba(255, 255, 255, 0.55)';
export const NAV_INACTIVE_DUOTONE = 'rgba(255, 255, 255, 0.28)';
export const NAV_INACTIVE_LABEL = 'rgba(255, 255, 255, 0.45)';

/** Layered elevation for luxury floating nav bar. */
export const NAV_BAR_GLOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.32,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 14 },
  elevation: 12,
} as const;

export const WALLET_CARD_SURFACE = HOME_WALLET_SURFACE;

/** Ambient wash — wallet hero only (not a shadow). */
export const ESO_PAY_GOLD_AMBIENT = 'rgba(255, 255, 255, 0.03)' as const;

/** Apple Wallet–style soft elevation — layered depth. */
export const WALLET_CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.18,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
} as const;

export const WALLET_CARD_SHADOW_OUTER = {
  shadowColor: '#000000',
  shadowOpacity: 0.14,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 16 },
  elevation: 5,
} as const;

/** Soft ambient drop beneath wallet card. */
export const WALLET_CARD_AMBIENT_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.22,
  shadowRadius: 32,
  shadowOffset: { width: 0, height: 20 },
  elevation: 3,
} as const;

/** Premium card elevation — services & transactions. */
export const PREMIUM_CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.22,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
} as const;

/** Service bill cards — far ambient float (outer wrapper). */
export const BILL_CARD_AMBIENT_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.28,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 16 },
  elevation: 3,
} as const;

/** Service bill cards — near crisp contact shadow (inner lift). */
export const SERVICE_BILL_CARD_SHADOW = {
  shadowColor: '#04070F',
  shadowOpacity: 0.38,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
} as const;

/** Soft rim wash under hub cards. */
export const BILL_CARD_GOLD_RIM = 'rgba(255, 255, 255, 0.06)' as const;

/** @deprecated Use WALLET_CARD_SHADOW */
export const ESO_PAY_GOLD_SHADOW = WALLET_CARD_SHADOW;
