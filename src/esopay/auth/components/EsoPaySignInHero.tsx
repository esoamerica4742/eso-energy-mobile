import { StyleSheet, Text, View } from 'react-native';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';

const MONOGRAM = 52;

/** Eso Pay sign-in brand lockup — monogram + wordmark. */
export function EsoPaySignInHero() {
  return (
    <View style={styles.wrap}>
      <View style={styles.monogram}>
        <Text style={styles.letter}>E</Text>
      </View>
      <Text style={styles.wordmark}>ESO PAY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
    marginBottom: 32,
  },
  monogram: {
    width: MONOGRAM,
    height: MONOGRAM,
    borderRadius: MONOGRAM / 2,
    borderWidth: 1.5,
    borderColor: ESOPAY_SIGN_IN.gold,
    backgroundColor: ESOPAY_SIGN_IN.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: inter.bold,
    fontSize: 22,
    color: ESOPAY_SIGN_IN.warmWhite,
    marginTop: -1,
  },
  wordmark: {
    fontFamily: inter.semibold,
    fontSize: 13,
    letterSpacing: 2.4,
    color: ESOPAY_SIGN_IN.gold,
  },
});
