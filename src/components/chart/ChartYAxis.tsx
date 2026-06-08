import { View, Text, StyleSheet } from 'react-native';
import { ChartColors, ChartMetrics, FontSize } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { getYAxisLabels } from '@/utils/chartUtils';

type Props = {
  yMin: number;
  yMax: number;
  unit: string;
  height: number;
};

export function ChartYAxis({ yMin, yMax, unit, height }: Props) {
  const labels = getYAxisLabels(yMin, yMax, ChartMetrics.gridLineCount, unit);

  return (
    <View style={[styles.wrap, { height }]}>
      {labels.map((label, index) => (
        <Text
          key={label}
          style={[
            styles.label,
            {
              top: (index / ChartMetrics.gridLineCount) * (height - 16) + 8,
            },
          ]}
        >
          {label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: ChartMetrics.yAxisWidth,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    right: 8,
    fontFamily: fonts.medium,
    fontSize: FontSize.micro,
    color: ChartColors.axisLabel,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
