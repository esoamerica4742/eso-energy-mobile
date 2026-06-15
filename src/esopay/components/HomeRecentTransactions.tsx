import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Receipt } from 'phosphor-react-native';
import { grid } from '@/esopay/theme/homeGrid';
import { useWalletTransactions } from '@/esopay/api/hooks/useBilling';
import { EsoPayInlineError } from '@/esopay/components/EsoPayInlineError';
import { Skeleton } from '@/esopay/components/Skeleton';
import { EsoPayOutlinePillButton } from '@/esopay/components/EsoPayOutlinePillButton';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import type { EsoPayWalletTransaction } from '@/esopay/api/types';
import {
  ESO_PAY_GOLD,
  ESO_PAY_GOLD_MUTED,
  ESO_PAY_GOLD_MUTED_06,
  ESO_PAY_GOLD_MUTED_35,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
  HOME_CARD_SURFACE,
  PREMIUM_CARD_SHADOW,
} from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';
import { formatCurrency } from '@/esopay/utils/currency';

function TransactionsEmptyIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.illustrationRingOuter} />
      <View style={styles.illustrationRingInner} />
      <Receipt size={10} color={ESO_PAY_GOLD} weight="duotone" duotoneColor={ESO_PAY_GOLD} style={styles.illustrationIcon} />
    </View>
  );
}

type RowModel = {
  id: string;
  merchant: string;
  initial: string;
  dateLabel: string;
  amountKobo: number;
  direction: 'in' | 'out';
  statusLabel: string;
};

function mapTransaction(tx: EsoPayWalletTransaction): RowModel {
  const direction =
    tx.type === 'credit' || tx.type === 'refund' || tx.type === 'reversal' ? 'in' : 'out';

  let dateLabel = tx.created_at;
  try {
    dateLabel = format(parseISO(tx.created_at), 'MMM d · h:mm a');
  } catch {
    // keep raw
  }

  const merchant =
    tx.narration?.trim() ||
    tx.monnify_transaction_reference?.slice(0, 18) ||
    (direction === 'in' ? 'Wallet credit' : 'Payment');

  return {
    id: tx.id,
    merchant,
    initial: merchant.charAt(0).toUpperCase() || 'P',
    dateLabel,
    amountKobo: direction === 'in' ? Math.abs(tx.amount_kobo) : -Math.abs(tx.amount_kobo),
    direction,
    statusLabel: direction === 'in' ? 'Received' : 'Paid',
  };
}

function MerchantLogo({
  initial,
  direction,
}: {
  initial: string;
  direction: 'in' | 'out';
}) {
  return (
    <View style={styles.logoWrap}>
      <View
        style={[
          styles.logoCircle,
          direction === 'in' ? styles.logoCircleIn : styles.logoCircleOut,
        ]}
      >
        <Text style={styles.logoInitial}>{initial}</Text>
      </View>
      <View
        style={[
          styles.statusDot,
          direction === 'in' ? styles.statusDotIn : styles.statusDotOut,
        ]}
      />
    </View>
  );
}

type Props = {
  onViewAll?: () => void;
};

export const HomeRecentTransactions = memo(function HomeRecentTransactions({ onViewAll }: Props) {
  const ledgerQuery = useWalletTransactions({ page: 1, limit: 4 });
  const isInitialLoad = ledgerQuery.isPending && ledgerQuery.data === undefined;

  const rows = useMemo(() => {
    return (ledgerQuery.data?.data ?? []).map(mapTransaction).slice(0, 4);
  }, [ledgerQuery.data?.data]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <EsoPaySectionLabel>Recent Transactions</EsoPaySectionLabel>
        {onViewAll ? (
          <EsoPayOutlinePillButton
            label={rows.length === 0 ? 'History' : 'View all'}
            onPress={onViewAll}
            accessibilityLabel="View all transactions"
          />
        ) : null}
      </View>

      {ledgerQuery.isError ? (
        <EsoPayInlineError
          message="We could not load your recent transactions."
          onRetry={() => void ledgerQuery.refetch()}
        />
      ) : isInitialLoad ? (
        <View style={styles.list}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.row}>
              <Skeleton height={44} width={44} borderRadius={22} />
              <View style={styles.copy}>
                <Skeleton height={14} width="68%" borderRadius={6} />
                <Skeleton height={11} width="42%" borderRadius={6} style={{ marginTop: 8 }} />
              </View>
              <Skeleton height={14} width={72} borderRadius={6} />
            </View>
          ))}
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.empty}>
          <TransactionsEmptyIllustration />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyBody}>
            Start by buying airtime, data, or paying a bill.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {rows.map((row) => (
            <View key={row.id} style={styles.row}>
              <MerchantLogo initial={row.initial} direction={row.direction} />
              <View style={styles.copy}>
                <Text style={styles.merchant} numberOfLines={1}>
                  {row.merchant}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.date}>{row.dateLabel}</Text>
                  <View style={styles.metaDot} />
                  <Text
                    style={[
                      styles.status,
                      row.direction === 'in' ? styles.statusIn : styles.statusOut,
                    ]}
                  >
                    {row.statusLabel}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.amount,
                  row.direction === 'in' ? styles.amountIn : styles.amountOut,
                ]}
              >
                {row.direction === 'in' ? '+' : '−'}
                {formatCurrency(Math.abs(row.amountKobo))}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: grid.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: HOME_CARD_SURFACE,
    paddingVertical: 5,
    paddingHorizontal: grid.sm,
    gap: 2,
    ...PREMIUM_CARD_SHADOW,
  },
  illustration: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  illustrationRingOuter: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(211, 153, 26, 0.08)',
  },
  illustrationRingInner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ESO_PAY_GOLD_MUTED_06,
  },
  illustrationIcon: {
    opacity: 0.48,
  },
  emptyTitle: {
    fontFamily: inter.medium,
    fontSize: 14,
    fontWeight: '500',
    color: ESO_PAY_TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: inter.regular,
    fontSize: 13,
    lineHeight: 17,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
    maxWidth: 260,
  },
  list: {
    gap: grid.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: grid.sm,
    paddingVertical: grid.sm,
    paddingHorizontal: grid.sm,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: HOME_CARD_SURFACE,
    ...PREMIUM_CARD_SHADOW,
  },
  logoWrap: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoCircleIn: {
    backgroundColor: ESO_PAY_GOLD_MUTED,
    borderColor: ESO_PAY_GOLD_MUTED_35,
  },
  logoCircleOut: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: HOME_CARD_BORDER,
  },
  logoInitial: {
    fontFamily: inter.bold,
    fontSize: 16,
    fontWeight: '700',
    color: ESO_PAY_GOLD,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: HOME_CARD_SURFACE,
  },
  statusDotIn: {
    backgroundColor: ESO_PAY_GOLD,
  },
  statusDotOut: {
    backgroundColor: 'rgba(245, 240, 232, 0.35)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  merchant: {
    fontFamily: inter.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontFamily: inter.regular,
    fontSize: 11,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4A5568',
  },
  status: {
    fontFamily: inter.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  statusIn: {
    color: ESO_PAY_GOLD,
  },
  statusOut: {
    color: ESO_PAY_TEXT_SECONDARY,
  },
  amount: {
    fontFamily: inter.semibold,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  amountIn: {
    color: ESO_PAY_GOLD,
  },
  amountOut: {
    color: ESO_PAY_TEXT_PRIMARY,
  },
});
