/**
 * Canonical bill category card dimensions — single source of truth.
 * Used by Home (Pay a Bill), Bills hub (See all), category grids, and skeletons.
 */
export const BILL_CATEGORY_CARD_HEIGHT = 140;
/** Home services grid — ~10% shorter than billing hub cards. */
export const HOME_BILL_CATEGORY_CARD_HEIGHT = 96;
export const HOME_BILL_GRID_INNER_PADDING = 10;
/** Reference width for carousel layouts; grid columns derive width from screen. */
export const BILL_CATEGORY_CARD_WIDTH = 160;
export const BILL_CATEGORY_CARD_ASPECT_RATIO =
  BILL_CATEGORY_CARD_WIDTH / BILL_CATEGORY_CARD_HEIGHT;

export const BILL_PAY_CARD_GAP = 4;

export const BILL_PAY_GRID_COLS = 2;
export const BILL_PAY_GRID_ITEM_MARGIN = 2;
export const BILL_PAY_GRID_INNER_PADDING = 18;
export const BILL_PAY_GRID_H_PAD = 14;

/** @deprecated Use BILL_CATEGORY_CARD_WIDTH */
export const BILL_PAY_CARD_WIDTH = BILL_CATEGORY_CARD_WIDTH;
/** @deprecated Use BILL_CATEGORY_CARD_HEIGHT */
export const BILL_PAY_CARD_HEIGHT = BILL_CATEGORY_CARD_HEIGHT;
/** @deprecated Use BILL_CATEGORY_CARD_HEIGHT */
export const BILL_PAY_GRID_MIN_HEIGHT = BILL_CATEGORY_CARD_HEIGHT;
