import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { FleetFilter } from '@/types/fleet';

type Props = {
  query: string;
  filter: FleetFilter;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: FleetFilter) => void;
};

const FILTERS: { key: FleetFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'stale', label: 'Stale' },
  { key: 'offline', label: 'Offline' },
  { key: 'alerts', label: 'Alerts' },
];

export function FleetFilterBar({ query, filter, onQueryChange, onFilterChange }: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={onQueryChange}
        placeholder="Search sites…"
        placeholderTextColor={Colors.textMuted}
        accessibilityLabel="Search sites"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <View style={styles.chips}>
        {FILTERS.map((chip) => {
          const active = filter === chip.key;
          return (
            <Pressable
              key={chip.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                if (chip.key === filter) return;
                void Haptics.selectionAsync();
                onFilterChange(chip.key);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filter ${chip.label}`}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  search: {
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    fontFamily: fonts.regular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: Colors.goldBorderStrong,
    backgroundColor: Colors.goldWhisper,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  chipTextActive: {
    color: Colors.gold,
  },
});
