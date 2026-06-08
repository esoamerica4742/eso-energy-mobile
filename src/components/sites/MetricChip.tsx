import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  label: string;
  value: string;
  muted?: boolean;
};

export const MetricChip = memo(function MetricChip({ label, value, muted = false }: Props) {
  return (
    <View
      style={styles.chip}
      accessibilityRole="text"
      accessibilityLabel={`${label} ${value}`}
    >
      <Text style={[styles.value, muted && styles.valueMuted]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  valueMuted: {
    color: Colors.textMuted,
  },
  label: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: Colors.textMuted,
  },
});
