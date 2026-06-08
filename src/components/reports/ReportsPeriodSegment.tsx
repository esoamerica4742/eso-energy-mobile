import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { ReportPeriod } from '@/lib/reportsData';

type Props = {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
};

const OPTIONS: { key: ReportPeriod; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
];

export function ReportsPeriodSegment({ value, onChange }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {OPTIONS.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => {
              if (option.key === value) return;
              void Haptics.selectionAsync();
              onChange(option.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.goldWhisper,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  labelActive: {
    color: Colors.gold,
    fontFamily: fonts.bold,
  },
});
