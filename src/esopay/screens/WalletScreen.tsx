import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEsoPayBack } from '@/esopay/navigation/useEsoPayBack';
import { useWallet, useWalletTransactions } from '@/esopay/api/hooks/useBilling';
import type { EsoPayWalletTransaction } from '@/esopay/api/types';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { esopayFundWalletHref } from '@/esopay/navigation/routes';
import { MonnifyWalletCard } from '@/esopay/components/MonnifyWalletCard';
import { EsoPayCashbackGlance } from '@/esopay/components/EsoPayCashbackGlance';
import { EsoPayInlineError } from '@/esopay/components/EsoPayInlineError';
import { EsoPayFilterChips } from '@/esopay/components/EsoPayFilterChips';
import { LedgerEmptyState, LedgerSkeletonList } from '@/esopay/components/LedgerListStates';
import { toEsoPayApiError } from '@/esopay/api/client';
import { WalletLedgerRow } from '@/esopay/components/WalletLedgerRow';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { grid } from '@/esopay/theme/homeGrid';

type LedgerFilter = 'ALL' | 'CREDIT' | 'DEBIT';

const FILTERS: readonly LedgerFilter[] = ['ALL', 'CREDIT', 'DEBIT'];
const FILTER_LABELS: Record<LedgerFilter, string> = {
  ALL: 'All',
  CREDIT: 'Credit',
  DEBIT: 'Debit',
};

export function WalletScreen() {
  const router = useRouter();
  const goBack = useEsoPayBack();
  const scrollPad = useEsoPayScrollPadding({ tabBar: false });
  const [filter, setFilter] = useState<LedgerFilter>('ALL');
  const [page, setPage] = useState(1);

  const walletQuery = useWallet();
  const ledgerQuery = useWalletTransactions({ page, limit: 30 });

  const filtered = useMemo(() => {
    const transactions = ledgerQuery.data?.data ?? [];
    return transactions.filter((tx) => {
      if (filter === 'ALL') return true;
      if (filter === 'CREDIT') {
        return tx.type === 'credit' || tx.type === 'refund' || tx.type === 'reversal';
      }
      return tx.type === 'debit' || tx.type === 'bill_payment';
    });
  }, [filter, ledgerQuery.data?.data]);

  const onRefresh = useCallback(() => {
    void walletQuery.refetch();
    void ledgerQuery.refetch();
  }, [ledgerQuery, walletQuery]);

  const onFilterChange = useCallback((next: string) => {
    setFilter(next as LedgerFilter);
    setPage(1);
  }, []);

  const balance = walletQuery.data?.balance_kobo ?? 0;
  const walletLoading = walletQuery.isLoading && walletQuery.data == null;

  const listHeader = (
    <View style={styles.headerBlock}>
      <MonnifyWalletCard
        balanceKobo={balance}
        loading={walletLoading}
        stableDisplay
        onFundPress={() => router.push(esopayFundWalletHref())}
      />
      <EsoPayCashbackGlance />

      {walletQuery.isError && walletQuery.data == null ? (
        <EsoPayInlineError
          title="Wallet unavailable"
          message="We could not load your balance. Check your connection and try again."
          onRetry={() => void walletQuery.refetch()}
        />
      ) : null}

      <Text style={styles.activityTitle}>Transactions</Text>

      <EsoPayFilterChips
        options={FILTERS}
        value={filter}
        onChange={onFilterChange}
        labels={FILTER_LABELS}
      />
    </View>
  );

  const listEmpty =
    ledgerQuery.isError && filtered.length === 0 ? (
      <EsoPayInlineError
        message={
          toEsoPayApiError(ledgerQuery.error).message ||
          'We could not load your transactions.'
        }
        onRetry={() => void ledgerQuery.refetch()}
      />
    ) : ledgerQuery.isLoading ? (
      <LedgerSkeletonList rows={4} />
    ) : (
      <LedgerEmptyState body="Wallet activity will appear here." />
    );

  const renderTx = useCallback(
    ({ item }: { item: EsoPayWalletTransaction }) => (
      <WalletLedgerRow transaction={item} />
    ),
    [],
  );

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title="Wallet" canGoBack onBack={goBack} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTx}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: scrollPad.paddingBottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={ledgerQuery.isFetching && !ledgerQuery.isLoading}
            onRefresh={onRefresh}
            tintColor={ESO_PAY_TEXT_SECONDARY}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: grid.sm,
    paddingTop: grid.sm,
    flexGrow: 1,
  },
  headerBlock: {
    gap: grid.md,
    marginBottom: grid.sm,
  },
  activityTitle: {
    fontFamily: ds.font.title,
    fontSize: 15,
    lineHeight: 20,
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: -0.1,
    marginTop: grid.xs,
  },
});
