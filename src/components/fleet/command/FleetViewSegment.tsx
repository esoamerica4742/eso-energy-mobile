import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { FleetViewMode } from '@/types/fleet';

type Props = {
  value: FleetViewMode;
  onChange: (mode: FleetViewMode) => void;
};

const OPTIONS: { key: FleetViewMode; label: string }[] = [
  { key: 'list', label: 'List' },
  { key: 'overview', label: 'Overview' },
];

export function FleetViewSegment({ value, onChange }: Props) {
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
            accessibilityLabel={`${option.label} view`}
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
    marginBottom: Spacing.sm,
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
    letterSpacing: 0.4,
  },
  labelActive: {
    color: Colors.gold,
  },
});
