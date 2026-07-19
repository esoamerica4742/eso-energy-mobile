import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RotateCcw } from 'lucide-react-native';
import type { BillHistoryRowModel } from '@/esopay/lib/billHistoryDisplay';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import {
  ESO_PAY_SURFACE,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  rows: BillHistoryRowModel[];
  onRepeat: (row: BillHistoryRowModel) => void;
  /** When empty, still show section with habit copy. */
  showEmptyHint?: boolean;
};

export const BillsPayAgainStrip = memo(function BillsPayAgainStrip({
  rows,
  onRepeat,
  showEmptyHint = true,
}: Props) {
  if (rows.length === 0) {
    if (!showEmptyHint) return null;
    return (
      <View style={styles.wrap}>
        <EsoPaySectionLabel>Pay again</EsoPaySectionLabel>
        <Text style={styles.emptyHint}>Pay a bill to see it here</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel>Pay again</EsoPaySectionLabel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {rows.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Pay again ${item.distributor}, ${formatCurrency(item.amountKobo)}`}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRepeat(item);
            }}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <View style={[styles.logo, { backgroundColor: item.brand.logoBg }]}>
              <Text style={[styles.logoText, { color: item.brand.logoFg }]} numberOfLines={1}>
                {item.brand.logoText}
              </Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name} numberOfLines={1}>
                {item.distributor}
              </Text>
              <Text style={styles.amount}>{formatCurrency(item.amountKobo)}</Text>
            </View>
            <RotateCcw size={16} color={ESO_PAY_TEXT_SECONDARY} strokeWidth={2.2} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  emptyHint: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  row: {
    gap: 10,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 200,
    maxWidth: 260,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
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
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  amount: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
});
