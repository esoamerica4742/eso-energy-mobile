import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PayBills, PayBillsFonts } from '@/esopay/auth/payBillsTheme';

const SIZE = 48;

export function PayBillsHeroMark() {
  return (
    <View style={styles.wrap}>
      <View style={styles.glow}>
        <LinearGradient
          colors={['rgba(201,168,76,0.08)', 'rgba(201,168,76,0.03)', 'transparent']}
          locations={[0, 0.5, 0.65]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.glowOrb}
        />
      </View>
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
  glow: {
    position: 'absolute',
    width: SIZE + 28,
    height: SIZE + 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOrb: {
    width: SIZE + 28,
    height: SIZE + 28,
    borderRadius: (SIZE + 28) / 2,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    borderColor: PayBills.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PayBills.bgSurface,
  },
  letter: {
    fontFamily: PayBillsFonts.soraExtra,
    fontSize: 24,
    color: PayBills.gold,
    marginTop: -1,
  },
});
