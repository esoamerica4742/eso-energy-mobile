import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { PayBills, PayBillsFonts } from '@/esopay/auth/payBillsTheme';

type Props = {
  onBack?: () => void;
};

export function PayBillsHeader({ onBack }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.left}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backBtn}
            >
              <ChevronLeft size={20} color={PayBills.textPrimary} strokeWidth={2.2} />
            </Pressable>
          ) : null}
          <Text style={styles.wordmark}>ESO PAY</Text>
        </View>
        <View style={styles.trust}>
          <Lock size={10} color={PayBills.gold} strokeWidth={2.2} />
          <Text style={styles.trustText}>SECURE</Text>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backBtn: {
    marginLeft: -4,
    padding: 2,
  },
  wordmark: {
    fontFamily: PayBillsFonts.sora,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: PayBills.textPrimary,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontFamily: PayBillsFonts.soraMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: PayBills.textPrimary,
  },
  divider: {
    marginTop: 12,
    height: 1,
    backgroundColor: PayBills.borderDefault,
  },
});
