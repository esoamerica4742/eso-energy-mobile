import { StyleSheet, Text, View } from 'react-native';
import { ds } from '@/esopay/theme/designSystem';
import { inter } from '@/theme/fonts';

const SIZE = 48;

export function PayBillsHeroMark() {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Text style={styles.letter}>E</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    borderColor: ds.color.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ds.color.surface1,
  },
  letter: {
    fontFamily: inter.bold,
    fontSize: 24,
    color: ds.color.gold,
    marginTop: -1,
  },
});
