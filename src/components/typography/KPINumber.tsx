import { View, Text, StyleSheet } from 'react-native';
import { useCountUp } from '@/hooks/useCountUp';
import { Colors, FontSize } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  currency: string;
  value: number;
  muted?: boolean;
};

export function KPINumber({ currency, value, muted = false }: Props) {
  const animatedValue = useCountUp(value, 1400, 0);
  const color = muted ? Colors.textMuted : Colors.gold;

  return (
    <View style={styles.row}>
      <Text style={[styles.currency, { color }]}>{currency}</Text>
      <Text
        style={[styles.number, { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {animatedValue}
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
  currency: {
    fontFamily: fonts.bold,
    fontSize: FontSize.unit,
    lineHeight: 44,
    letterSpacing: -0.5,
    paddingBottom: 4,
  },
  number: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: FontSize.hero,
    letterSpacing: -1.2,
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
  },
});
