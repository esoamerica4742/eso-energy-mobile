import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useRecentUtilityPayments } from '@/esopay/api/hooks/useBilling';
import { BillsPayAgainStrip } from '@/esopay/components/bills/BillsPayAgainStrip';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import {
  recentPaymentToHistoryRow,
  type BillHistoryRowModel,
} from '@/esopay/lib/billHistoryDisplay';
import { pickPayAgainRows } from '@/esopay/lib/billsPayAgain';
import { grid } from '@/esopay/theme/homeGrid';

/** Home habit strip — Pay again → PIN (via PaymentModalContext). */
export const EsoPayHomePayAgain = memo(function EsoPayHomePayAgain() {
  const { openPayment } = usePaymentModal();
  const recentQuery = useRecentUtilityPayments({ limit: 40 });

  useFocusEffect(
    useCallback(() => {
      void recentQuery.refetch();
    }, [recentQuery]),
  );

  const rows = useMemo(() => {
    const history = (recentQuery.data ?? []).map(recentPaymentToHistoryRow);
    return pickPayAgainRows(history);
  }, [recentQuery.data]);

  const onRepeat = useCallback(
    (row: BillHistoryRowModel) => {
      openPayment({
        provider: row.payment.provider,
        accountNumber: row.payment.account_number,
        amountKobo: row.payment.amount_kobo,
      });
    },
    [openPayment],
  );

  return (
    <View style={styles.wrap}>
      <BillsPayAgainStrip rows={rows} onRepeat={onRepeat} showEmptyHint={false} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: grid.sm,
  },
});
