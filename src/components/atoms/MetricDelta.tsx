import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = { delta: string; positive: boolean };

export function MetricDelta({ delta, positive }: Props) {
  return (
    <View style={[styles.wrap, { backgroundColor: positive ? colors.positiveBg : colors.negativeBg }]}>
      <Text style={[styles.arrow, { color: positive ? colors.positiveText : colors.negativeText }]}>
        {positive ? '↑' : '↓'}
      </Text>
      <Text style={[styles.text, { color: positive ? colors.positiveText : colors.negativeText }]}>
        {delta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  arrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.micro,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    fontVariant: ['tabular-nums'],
  },
});
