import { StyleSheet, Text, View } from 'react-native';
import { Envelope } from 'phosphor-react-native';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';

type Props = {
  email: string;
};

export function EsoPayVerifyEmailChip({ email }: Props) {
  return (
    <View style={styles.chip}>
      <Envelope size={16} color={ESOPAY_SIGN_IN.teal} weight="duotone" />
      <Text style={styles.email} numberOfLines={1}>
        {email}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ESOPAY_SIGN_IN.border,
    backgroundColor: ESOPAY_SIGN_IN.surfaceRaised,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  email: {
    flexShrink: 1,
    fontFamily: inter.medium,
    fontSize: 14,
    color: ESOPAY_SIGN_IN.warmWhite,
  },
});
