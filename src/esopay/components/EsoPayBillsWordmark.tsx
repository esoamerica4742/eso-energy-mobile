import { memo } from 'react';
import { Platform, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { ESO_PAY_BILLS_BRAND } from '@/esopay/theme/brand';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  size?: 'home' | 'header';
};

const SIZE_STYLES: Record<NonNullable<Props['size']>, TextStyle> = {
  home: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 1.1,
  },
  header: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 1.1,
  },
};

/** High-contrast Eso Pay Bills wordmark — solid text (no mask; always visible). */
export const EsoPayBillsWordmark = memo(function EsoPayBillsWordmark({
  size = 'home',
}: Props) {
  const isHome = size === 'home';

  return (
    <View style={[styles.wrap, isHome && styles.wrapHome]}>
      <Text
        style={[styles.mark, SIZE_STYLES[size], isHome && styles.markHome]}
        accessibilityRole="header"
        accessibilityLabel={ESO_PAY_BILLS_BRAND}
      >
        {ESO_PAY_BILLS_BRAND}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
  wrapHome: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  mark: {
    fontFamily: fonts.uiBold,
    color: luxury.gold,
    fontWeight: '600',
  },
  markHome: {
    color: luxury.gold,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(212, 160, 23, 0.55)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
      },
      android: {
        elevation: 0,
      },
      default: {},
    }),
  },
});
