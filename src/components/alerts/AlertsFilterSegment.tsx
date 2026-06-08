import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { alertFilterLabel, type AlertFilter } from '@/lib/alertsData';

type Props = {
  value: AlertFilter;
  onChange: (filter: AlertFilter) => void;
  counts: Record<AlertFilter, number>;
};

const OPTIONS: AlertFilter[] = ['all', 'critical', 'warning', 'info'];

export function AlertsFilterSegment({ value, onChange, counts }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {OPTIONS.map((option) => {
        const active = value === option;
        const count = counts[option];
        return (
          <Pressable
            key={option}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => {
              if (option === value) return;
              void Haptics.selectionAsync();
              onChange(option);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${alertFilterLabel(option)}, ${count} alerts`}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{alertFilterLabel(option)}</Text>
            {count > 0 ? (
              <View style={[styles.countBadge, active && styles.countBadgeActive]}>
                <Text style={[styles.countText, active && styles.countTextActive]}>{count}</Text>
              </View>
            ) : null}
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
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
  },
  segmentActive: {
    backgroundColor: Colors.goldWhisper,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  labelActive: {
    color: Colors.gold,
    fontFamily: fonts.bold,
  },
  countBadge: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  countBadgeActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
  },
  countText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.micro,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  countTextActive: {
    color: Colors.gold,
  },
});
