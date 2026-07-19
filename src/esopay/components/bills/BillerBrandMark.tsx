import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BillerBrandStyle } from '@/esopay/data/billerBrands';
import { fonts } from '@/esopay/theme/typography';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  brand: BillerBrandStyle;
  size?: Size;
};

const SIZE: Record<Size, { outer: number; inner: number; font: number; ring: number }> = {
  sm: { outer: 42, inner: 34, font: 10, ring: 2 },
  md: { outer: 48, inner: 40, font: 11, ring: 2 },
  lg: { outer: 52, inner: 44, font: 12, ring: 2.5 },
};

/** Premium network / DISCO mark — accent halo + sheen, not a flat chip. */
export const BillerBrandMark = memo(function BillerBrandMark({ brand, size = 'md' }: Props) {
  const s = SIZE[size];
  const long = brand.logoText.length >= 4;

  return (
    <View
      style={[
        styles.outer,
        {
          width: s.outer,
          height: s.outer,
          borderRadius: s.outer / 2,
          padding: s.ring,
          shadowColor: brand.accent,
          shadowOpacity: 0.45,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        },
      ]}
    >
      <LinearGradient
        colors={[`${brand.accent}99`, `${brand.accent}22`, 'rgba(255,255,255,0.08)']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.inner,
          {
            width: s.inner,
            height: s.inner,
            borderRadius: s.inner / 2,
            backgroundColor: brand.logoBg,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.12)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text
          style={[
            styles.text,
            {
              color: brand.logoFg,
              fontSize: long ? s.font - 1 : s.font,
              letterSpacing: long ? 0.1 : 0.4,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {brand.logoText}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  text: {
    fontFamily: fonts.uiBold,
    fontWeight: '700',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
