import { StyleSheet, Text, View } from 'react-native';
import { Lock, ShieldCheck } from 'phosphor-react-native';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';

const ROWS = [
  { Icon: Lock, text: 'Encrypted sign-in and wallet data on this device.' },
  { Icon: ShieldCheck, text: 'Transaction PIN required before every payment.' },
] as const;

export function EsoPayTrustStrip() {
  return (
    <View style={styles.card}>
      {ROWS.map(({ Icon, text }) => (
        <View key={text} style={styles.row}>
          <Icon size={16} color={ESOPAY_SIGN_IN.teal} weight="duotone" />
          <Text style={styles.copy}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ESOPAY_SIGN_IN.border,
    backgroundColor: ESOPAY_SIGN_IN.surfaceRaised,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
    fontFamily: inter.regular,
    fontSize: 12,
    lineHeight: 17,
    color: ESOPAY_SIGN_IN.muted,
  },
});

