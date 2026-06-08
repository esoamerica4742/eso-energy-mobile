import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import type { EsoPayWalletTransaction, WalletTransactionType } from '@/esopay/api/types';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  transaction: EsoPayWalletTransaction;
};

function typeMeta(type: WalletTransactionType): {
  label: string;
  Icon: LucideIcon;
  direction: 'in' | 'out';
} {
  switch (type) {
    case 'credit':
      return { label: 'Wallet credit', Icon: ArrowDownLeft, direction: 'in' };
    case 'debit':
      return { label: 'Wallet debit', Icon: ArrowUpRight, direction: 'out' };
    case 'bill_payment':
      return { label: 'Bill payment', Icon: Receipt, direction: 'out' };
    case 'refund':
      return { label: 'Refund', Icon: RotateCcw, direction: 'in' };
    case 'reversal':
      return { label: 'Reversal', Icon: RotateCcw, direction: 'in' };
    default:
      return { label: type, Icon: Receipt, direction: 'out' };
  }
}

function statusColor(status: EsoPayWalletTransaction['status']): string {
  switch (status) {
    case 'success':
      return T.color.gold.primary;
    case 'failed':
      return T.color.red.alert;
    case 'pending':
    default:
      return T.color.amber.partial;
  }
}

export const WalletLedgerRow = memo(function WalletLedgerRow({ transaction }: Props) {
  const meta = typeMeta(transaction.type);
  const amountColor =
    meta.direction === 'in' ? T.color.gold.primary : T.color.text.primary;
  const prefix = meta.direction === 'in' ? '+' : '−';
  const statusTint = statusColor(transaction.status);

  let dateLabel = transaction.created_at;
  try {
    dateLabel = format(parseISO(transaction.created_at), 'MMM d, yyyy · HH:mm');
  } catch {
    // keep raw
  }

  const reference =
    transaction.monnify_transaction_reference ??
    transaction.monnify_payment_reference ??
    transaction.narration ??
    'Ledger entry';

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { borderColor: `${statusTint}33` }]}>
        <meta.Icon size={T.icon.inline} color={T.color.gold.primary} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.typeLabel}>{meta.label}</Text>
          <Text style={[styles.amount, { color: amountColor }]}>
            {prefix}
            {formatCurrency(transaction.amount_kobo, 'NGN')}
          </Text>
        </View>

        <Text style={styles.narration} numberOfLines={1}>
          {transaction.narration ?? reference}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.date}>{dateLabel}</Text>
          <View
            style={[
              styles.statusBadge,
              { borderColor: `${statusTint}44`, backgroundColor: `${statusTint}14` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusTint }]}>
              {transaction.status}
            </Text>
          </View>
        </View>

        {transaction.balance_after_kobo != null ? (
          <Text style={styles.balanceAfter}>
            Balance after {formatCurrency(transaction.balance_after_kobo, 'NGN')}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: T.spacing.md,
    backgroundColor: T.color.bg.surface,
    borderRadius: T.radius.sm,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    padding: T.layout.cardPaddingHorizontal,
    marginBottom: T.spacing.sm,
    ...T.shadow.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: T.radius.sm,
    borderWidth: 1,
    backgroundColor: T.color.bg.inset,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: T.spacing.sm,
    marginBottom: T.spacing.xs,
  },
  typeLabel: {
    flex: 1,
    fontFamily: esopayFonts.subheading,
    fontSize: T.type.body.size,
    color: T.color.text.primary,
  },
  amount: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.h3.size,
    lineHeight: T.type.h3.lineHeight,
  },
  narration: {
    fontFamily: esopayFonts.mono,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
    marginBottom: T.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: T.spacing.sm,
  },
  date: {
    flex: 1,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.disabled,
  },
  statusBadge: {
    paddingHorizontal: T.spacing.sm,
    paddingVertical: 2,
    borderRadius: T.radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    textTransform: 'capitalize',
  },
  balanceAfter: {
    marginTop: T.spacing.xs,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
  },
});
