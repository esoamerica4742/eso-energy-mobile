import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { BillStatus } from '@/esopay/api/types';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';

export type BillFilterChip = 'all' | BillStatus;

const CHIPS: { id: BillFilterChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
];

type Props = {
  value: BillFilterChip;
  onChange: (value: BillFilterChip) => void;
};

export const FilterChipBar = memo(function FilterChipBar({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CHIPS.map((chip) => {
        const active = chip.id === value;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onChange(chip.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{chip.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: T.layout.screenMargin,
    gap: T.spacing.sm,
    paddingBottom: T.spacing.sm,
  },
  chip: {
    paddingHorizontal: T.spacing.lg,
    paddingVertical: T.spacing.sm,
    borderRadius: T.radius.full,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    backgroundColor: T.color.bg.surface,
  },
  chipActive: {
    borderColor: T.color.border.active,
    backgroundColor: `${T.color.gold.primary}18`,
  },
  chipLabel: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.label.size,
    color: T.color.text.secondary,
    letterSpacing: T.type.label.letterSpacing,
  },
  chipLabelActive: {
    color: T.color.gold.shimmer,
  },
});
