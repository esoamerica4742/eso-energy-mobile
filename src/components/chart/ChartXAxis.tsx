import { View, Text, StyleSheet } from 'react-native';
import { ChartColors, FontSize } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  timeRangeLabel: string;
  width: number;
};

export function ChartXAxis({ timeRangeLabel }: Props) {
  const totalMinutes = Number.parseInt(timeRangeLabel, 10) || 15;
  const labels = [
    `${Math.round(totalMinutes / 3)}m`,
    `${Math.round((totalMinutes * 2) / 3)}m`,
    `${totalMinutes}m`,
  ];

  return (
    <View style={styles.wrap}>
      {labels.map((label) => (
        <Text key={label} style={styles.label}>
          {label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: FontSize.micro,
    color: ChartColors.axisLabel,
    fontVariant: ['tabular-nums'],
  },
});
