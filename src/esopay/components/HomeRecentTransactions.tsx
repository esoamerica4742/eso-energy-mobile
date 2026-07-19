import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Receipt } from 'phosphor-react-native';
import { grid } from '@/esopay/theme/homeGrid';
import { useWalletTransactions } from '@/esopay/api/hooks/useBilling';
import { toEsoPayApiError } from '@/esopay/api/client';
import { EsoPayInlineError } from '@/esopay/components/EsoPayInlineError';
import { Skeleton } from '@/esopay/components/Skeleton';
import { EsoPayOutlinePillButton } from '@/esopay/components/EsoPayOutlinePillButton';
import { WalletLedgerRow } from '@/esopay/components/WalletLedgerRow';
import {
  ESO_PAY_CARD_HINT,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';

type Props = {
  onViewAll?: () => void;
};

export const HomeRecentTransactions = memo(function HomeRecentTransactions({ onViewAll }: Props) {
  const ledgerQuery = useWalletTransactions({ page: 1, limit: 4 });
  const isInitialLoad = ledgerQuery.isPending && ledgerQuery.data === undefined;

  const rows = useMemo(() => {
    return (ledgerQuery.data?.data ?? []).slice(0, 4);
  }, [ledgerQuery.data?.data]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        {onViewAll ? (
          <EsoPayOutlinePillButton
            label="History"
            onPress={onViewAll}
            accessibilityLabel="View transaction history"
          />
        ) : null}
      </View>

      {ledgerQuery.isError && rows.length === 0 ? (
        <EsoPayInlineError
          message={
            toEsoPayApiError(ledgerQuery.error).message ||
            'We could not load your recent transactions.'
          }
          onRetry={() => void ledgerQuery.refetch()}
        />
      ) : isInitialLoad ? (
        <View style={styles.list}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton height={40} width={40} borderRadius={20} />
              <View style={styles.skeletonCopy}>
                <Skeleton height={14} width="68%" borderRadius={6} />
                <Skeleton height={11} width="42%" borderRadius={6} style={{ marginTop: 8 }} />
              </View>
              <Skeleton height={16} width={72} borderRadius={6} />
            </View>
          ))}
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.empty}>
          <Receipt size={22} color={ESO_PAY_TEXT_SECONDARY} weight="regular" />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyBody}>Your activity will show up here.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {rows.map((tx) => (
            <WalletLedgerRow key={tx.id} transaction={tx} />
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: inter.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: grid.lg,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: inter.medium,
    fontSize: 14,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  emptyBody: {
    fontFamily: inter.regular,
    fontSize: 13,
    lineHeight: 18,
    color: ESO_PAY_CARD_HINT,
    textAlign: 'center',
  },
  list: {
    gap: 0,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: grid.sm,
    paddingVertical: 14,
  },
  skeletonCopy: {
    flex: 1,
    minWidth: 0,
  },
});
