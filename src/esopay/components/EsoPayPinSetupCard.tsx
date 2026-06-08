import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyRound } from 'lucide-react-native';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  pinConfigured: boolean;
  loading?: boolean;
  onPress: () => void;
};

export function EsoPayPinSetupCard({ pinConfigured, loading, onPress }: Props) {
  if (pinConfigured || loading) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel="Set up transaction PIN"
    >
      <View style={styles.iconWrap}>
        <KeyRound size={20} color={colors.gold} strokeWidth={2} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Set up your transaction PIN</Text>
        <Text style={styles.body}>
          Secure wallet payments with a 4-digit PIN before you pay bills or fund your wallet.
        </Text>
        <Text style={styles.cta}>Set up PIN →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  cta: {
    marginTop: 6,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.gold,
  },
});
