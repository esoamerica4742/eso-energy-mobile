import { View, Text, StyleSheet } from 'react-native';
import { FontSize } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  value: string;
  unit: string;
  valueColor: string;
  unitColor?: string;
  large?: boolean;
  muted?: boolean;
};

export function MetricValue({
  value,
  unit,
  valueColor,
  unitColor,
  large = true,
  muted = false,
}: Props) {
  const valueSize = large ? FontSize.metric : FontSize.sub;
  const unitSize = large ? FontSize.unit : FontSize.body;
  const color = muted ? valueColor : valueColor;

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.value,
          {
            fontSize: valueSize,
            lineHeight: large ? 44 : 28,
            color,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.unit,
          {
            fontSize: unitSize,
            lineHeight: large ? 36 : 24,
            color: unitColor ?? color,
          },
        ]}
        numberOfLines={1}
      >
        {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontFamily: fonts.bold,
    letterSpacing: 0,
    paddingBottom: 2,
  },
});
