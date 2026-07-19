/** Strict 8px grid for Eso Pay home dashboard. */
export const grid = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

/** Uniform vertical gap between home dashboard sections. */
export const HOME_SECTION_GAP = grid.sm;

/** Extra space between Services (Pay a Bill) and Recent Transactions. */
export const HOME_TRANSACTIONS_TOP_EXTRA = 0;
