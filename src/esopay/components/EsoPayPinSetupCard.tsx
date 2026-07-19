import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyRound } from 'lucide-react-native';
import { ESO_PAY_GOLD, ESO_PAY_TEXT_PRIMARY, ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  pinConfigured: boolean;
  loading?: boolean;
  onPress: () => void;
};

/** Inline PIN prompt — one line, no competing card chrome. */
export function EsoPayPinSetupCard({ pinConfigured, loading, onPress }: Props) {
  if (pinConfigured || loading) return null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Set up transaction PIN"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <KeyRound size={16} color={ESO_PAY_GOLD} strokeWidth={2} />
      <View style={styles.copy}>
        <Text style={styles.title}>Set transaction PIN</Text>
        <Text style={styles.body}>Required before your first payment</Text>
      </View>
      <Text style={styles.cta}>Set up</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  title: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 16,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  cta: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: ESO_PAY_GOLD,
  },
});
