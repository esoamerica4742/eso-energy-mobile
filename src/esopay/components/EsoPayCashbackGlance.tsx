import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useWalletCashback } from '@/esopay/api/hooks/useBilling';
import { ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';
import { formatCurrency } from '@/esopay/utils/currency';

/** Quiet lifetime cashback line under Home/Wallet balance. */
export const EsoPayCashbackGlance = memo(function EsoPayCashbackGlance() {
  const cashbackQuery = useWalletCashback();
  const lifetime = cashbackQuery.data?.lifetime_kobo ?? 0;
  if (lifetime <= 0) return null;

  return (
    <Text style={styles.line} accessibilityLabel={`Cashback earned ${formatCurrency(lifetime)}`}>
      Cashback earned {formatCurrency(lifetime)}
    </Text>
  );
});

const styles = StyleSheet.create({
  line: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
    marginTop: 4,
  },
});
