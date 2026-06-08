import type { EdgeInsets } from 'react-native-safe-area-context';

/** Shared horizontal gutter for marketing / auth / gateway shells. */
export const APP_HORIZONTAL_PAD = 24;

/** Breathing room below the OS status bar when top inset is already applied. */
export const HEADER_TOP_EXTRA = 8;

/** Default footer lift above the home indicator (≈ pb-6). */
export const FOOTER_BOTTOM_EXTRA = 24;

/** Legal / multi-line footers (≈ pb-8). */
export const FOOTER_BOTTOM_EXTRA_LARGE = 32;

/** Nav icon column width — aligns with brand marks and back controls. */
export const NAV_ICON_COLUMN_WIDTH = 32;

export function headerTopPadding(insets: EdgeInsets, extra = HEADER_TOP_EXTRA): number {
  return insets.top + extra;
}

/** Use when parent `SafeAreaView` already applies `edges` including `top`. */
export function headerTopExtra(extra = HEADER_TOP_EXTRA): number {
  return extra;
}

export function footerBottomPadding(
  insets: EdgeInsets,
  extra = FOOTER_BOTTOM_EXTRA,
): number {
  return Math.max(insets.bottom, 12) + extra;
}
