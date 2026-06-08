import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  label: string;
  accent?: string;
};

export function CellLabel({ label, accent }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, accent ? { color: accent } : null]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    letterSpacing: 1,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
});
