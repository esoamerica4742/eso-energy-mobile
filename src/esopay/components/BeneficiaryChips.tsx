import { memo, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { EsoPayBeneficiary } from '@/esopay/storage/beneficiaries';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  beneficiaries: EsoPayBeneficiary[];
  onSelect: (beneficiary: EsoPayBeneficiary) => void;
  selectedAccountNumber?: string;
};

export const BeneficiaryChips = memo(function BeneficiaryChips({
  beneficiaries,
  onSelect,
  selectedAccountNumber,
}: Props) {
  const handleSelect = useCallback(
    (item: EsoPayBeneficiary) => () => onSelect(item),
    [onSelect],
  );

  if (beneficiaries.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Saved beneficiaries</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {beneficiaries.map((item) => {
          const selected = selectedAccountNumber === item.accountNumber;
          return (
            <Pressable
              key={item.id}
              onPress={handleSelect(item)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipTitle, selected && styles.chipTitleSelected]}>
                {item.customerName ?? item.accountNumber}
              </Text>
              <Text style={styles.chipMeta}>{item.accountNumber}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  chip: {
    minWidth: 120,
    maxWidth: 180,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  chipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldGlow,
  },
  chipTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.white,
  },
  chipTitleSelected: {
    color: colors.gold,
  },
  chipMeta: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.muted,
  },
});
