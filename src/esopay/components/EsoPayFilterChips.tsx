import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';

type Props = {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  labels?: Record<string, string>;
};

/** Neutral filter chips — Wallet + History + Bills. */
export const EsoPayFilterChips = memo(function EsoPayFilterChips({
  options,
  value,
  onChange,
  labels,
}: Props) {
  return (
    <View style={styles.row}>
      {options.map((key) => {
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => {
              if (key === value) return;
              void Haptics.selectionAsync();
              onChange(key);
            }}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={labels?.[key] ?? key}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {labels?.[key] ?? key}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: ds.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  chipText: {
    fontFamily: ds.font.label,
    fontSize: ds.type.chip.fontSize,
    lineHeight: ds.type.chip.lineHeight,
    letterSpacing: 0.2,
    color: ESO_PAY_TEXT_SECONDARY,
    includeFontPadding: false,
  },
  chipTextActive: {
    color: ESO_PAY_TEXT_PRIMARY,
    fontFamily: ds.font.bodyStrong,
  },
});
