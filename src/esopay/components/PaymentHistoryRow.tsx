import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MonnifyBillPaymentStatus } from '@/esopay/api/types';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { formatCurrency } from '@/esopay/utils/currency';
import { format, parseISO } from 'date-fns';

type Props = {
  amountKobo: number;
  currency?: string;
  status: MonnifyBillPaymentStatus;
  reference: string;
  createdAt: string;
  failureMessage?: string | null;
};

function statusColor(status: MonnifyBillPaymentStatus): string {
  switch (status) {
    case 'success':
      return T.color.gold.primary;
    case 'failed':
    case 'reversed':
      return T.color.red.alert;
    case 'pending_fulfillment':
    case 'processing':
    case 'pending':
    default:
      return T.color.amber.partial;
  }
}

function statusLabel(status: MonnifyBillPaymentStatus): string {
  if (status === 'pending_fulfillment') return 'Queued';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const PaymentHistoryRow = memo(function PaymentHistoryRow({
  amountKobo,
  currency = 'NGN',
  status,
  reference,
  createdAt,
  failureMessage,
}: Props) {
  const color = statusColor(status);
  let dateLabel = createdAt;
  try {
    dateLabel = format(parseISO(createdAt), 'MMM d, yyyy · HH:mm');
  } catch {
    // keep raw
  }

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Text style={styles.amount}>{formatCurrency(amountKobo, currency)}</Text>
        <View style={[styles.badge, { borderColor: `${color}44`, backgroundColor: `${color}14` }]}>
          <Text style={[styles.badgeText, { color }]}>{statusLabel(status)}</Text>
        </View>
      </View>
      <Text style={styles.ref} numberOfLines={1}>
        Ref {reference}
      </Text>
      <Text style={styles.date}>{dateLabel}</Text>
      {failureMessage ? <Text style={styles.error}>{failureMessage}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    backgroundColor: T.color.bg.surface,
    borderRadius: T.radius.sm,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    padding: T.spacing.lg,
    marginBottom: T.spacing.sm,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: T.spacing.xs,
  },
  amount: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.h2.size,
    color: T.color.text.primary,
  },
  badge: {
    paddingHorizontal: T.spacing.sm,
    paddingVertical: T.spacing.xs,
    borderRadius: T.radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    textTransform: 'uppercase',
  },
  ref: {
    fontFamily: esopayFonts.mono,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
  },
  date: {
    marginTop: 2,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.disabled,
  },
  error: {
    marginTop: T.spacing.xs,
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    color: T.color.red.alert,
  },
});
