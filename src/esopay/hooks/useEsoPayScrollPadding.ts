import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/esopay/theme/spacing';

type Options = {
  /** Include space for the custom Eso Pay bottom tab bar */
  tabBar?: boolean;
  /** Extra top offset below the safe area (e.g. hero breathing room) */
  topExtra?: number;
  /** Extra bottom inset above the tab bar (e.g. last section breathing room) */
  bottomExtra?: number;
};

/** Consistent scroll insets for Eso Pay tabs and stack screens. */
export function useEsoPayScrollPadding(options: Options = {}) {
  const { tabBar = true, topExtra = 0, bottomExtra = 0 } = options;
  const insets = useSafeAreaInsets();

  return useMemo(
    () => ({
      paddingTop: insets.top + topExtra,
      paddingBottom:
        spacing.xxxl + bottomExtra + (tabBar ? spacing.navHeight : 0) + insets.bottom,
    }),
    [bottomExtra, insets.bottom, insets.top, tabBar, topExtra],
  );
}
