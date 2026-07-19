import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import type { EsoPayWalletTransaction, WalletTransactionType } from '@/esopay/api/types';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { formatWalletTransactionTitle } from '@/esopay/lib/formatWalletTransactionTitle';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  transaction: EsoPayWalletTransaction;
};

function directionFor(type: WalletTransactionType): 'in' | 'out' {
  if (type === 'credit' || type === 'refund' || type === 'reversal') return 'in';
  return 'out';
}

export const WalletLedgerRow = memo(function WalletLedgerRow({ transaction }: Props) {
  const direction = directionFor(transaction.type);
  const merchant = formatWalletTransactionTitle(
    transaction.narration,
    transaction.type,
    transaction.monnify_transaction_reference,
  );
  const initial = merchant.charAt(0).toUpperCase() || 'P';
  const prefix = direction === 'in' ? '+' : '';

  let dateLabel = transaction.created_at;
  try {
    dateLabel = format(parseISO(transaction.created_at), 'd MMM');
  } catch {
    // keep raw
  }

  const statusNote =
    transaction.status === 'failed'
      ? 'Failed'
      : transaction.status === 'pending'
        ? 'Pending'
        : null;

  return (
    <View style={styles.row}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoInitial}>{initial}</Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.merchant} numberOfLines={1}>
          {merchant}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {statusNote ? `${statusNote} · ${dateLabel}` : dateLabel}
        </Text>
      </View>

      <Text
        style={[
          styles.amount,
          transaction.status === 'failed' && styles.amountFailed,
        ]}
        numberOfLines={1}
      >
        {prefix}
        {formatCurrency(Math.abs(transaction.amount_kobo), 'NGN')}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  logoInitial: {
    fontFamily: ds.font.display,
    fontSize: 15,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
    includeFontPadding: false,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  merchant: {
    fontFamily: ds.font.bodyStrong,
    fontSize: 15,
    lineHeight: 20,
    color: ESO_PAY_TEXT_PRIMARY,
    includeFontPadding: false,
  },
  meta: {
    fontFamily: ds.font.caption,
    fontSize: 12,
    lineHeight: 16,
    color: ESO_PAY_TEXT_SECONDARY,
    includeFontPadding: false,
  },
  amount: {
    fontFamily: ds.font.amount,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
    color: ESO_PAY_TEXT_PRIMARY,
    includeFontPadding: false,
  },
  amountFailed: {
    color: ds.color.error,
  },
});
