import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RotateCcw } from 'lucide-react-native';
import type { BillHistoryRowModel } from '@/esopay/lib/billHistoryDisplay';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { TEAL_ACCENT } from '@/esopay/theme/brandColors';
import { luxury } from '@/esopay/theme/luxury';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  rows: BillHistoryRowModel[];
  onRepeat: (row: BillHistoryRowModel) => void;
};

export const BillsPayAgainStrip = memo(function BillsPayAgainStrip({ rows, onRepeat }: Props) {
  if (rows.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel style={styles.headingTracking}>Pay again</EsoPaySectionLabel>
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
            <RotateCcw size={16} color={TEAL_ACCENT} strokeWidth={2.2} />
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
  heading: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: luxury.warmWhite,
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
    borderColor: luxury.goldBorder,
    backgroundColor: luxury.surface,
  },
  chipPressed: {
    opacity: 0.92,
    backgroundColor: luxury.goldDim,
    borderColor: 'rgba(212, 160, 23, 0.35)',
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
    color: luxury.textPrimary,
  },
  amount: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: luxury.goldAccent,
  },
});
