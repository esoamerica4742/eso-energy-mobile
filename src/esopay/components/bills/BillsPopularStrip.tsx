import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getBillerBrandStyle } from '@/esopay/data/billerBrands';
import type { PopularHubBiller } from '@/esopay/lib/resolvePopularHubBillers';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import {
  ESO_PAY_SURFACE,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  items: PopularHubBiller[];
  onSelect: (item: PopularHubBiller) => void;
};

export const BillsPopularStrip = memo(function BillsPopularStrip({ items, onSelect }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel>Popular</EsoPaySectionLabel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) => {
          const brand = getBillerBrandStyle(
            item.provider ?? {
              id: `static-${item.meta.id}`,
              name: item.meta.name,
              category: item.meta.providerCategory,
              monnify_biller_code: item.meta.monnify_biller_code,
            },
          );
          return (
            <Pressable
              key={item.meta.id}
              accessibilityRole="button"
              accessibilityLabel={`Pay ${item.meta.shortLabel}`}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(item);
              }}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            >
              <View style={[styles.logo, { backgroundColor: brand.logoBg }]}>
                <Text style={[styles.logoText, { color: brand.logoFg }]} numberOfLines={1}>
                  {brand.logoText}
                </Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {item.meta.shortLabel}
              </Text>
              <Text style={styles.category} numberOfLines={1}>
                {item.meta.category === 'tv'
                  ? 'TV'
                  : item.meta.category.charAt(0).toUpperCase() + item.meta.category.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  row: {
    gap: 10,
    paddingRight: 4,
  },
  chip: {
    width: 88,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: ESO_PAY_SURFACE,
  },
  chipPressed: {
    opacity: 0.88,
  },
  logo: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  logoText: {
    fontFamily: fonts.uiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  name: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: ESO_PAY_TEXT_PRIMARY,
    textAlign: 'center',
  },
  category: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
  },
});
