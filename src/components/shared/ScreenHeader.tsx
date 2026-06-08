import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';

type Props = {
  leftLabel: string;
  rightLabel: string;
};

export function ScreenHeader({ leftLabel, rightLabel }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.accentBar} />
        <Text style={styles.leftLabel}>{leftLabel}</Text>
      </View>
      <Text style={styles.rightLabel}>{rightLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  accentBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  leftLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textPrimary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  rightLabel: {
    fontFamily: Fonts.light,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
