import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { format } from 'date-fns';
import { useEsoPayBack } from '@/esopay/navigation/useEsoPayBack';
import type { EsoPayWalletTransaction, WalletTransactionCategory } from '@/esopay/api/types';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { useWalletTransactionsInfinite } from '@/esopay/hooks/useWalletTransactionsInfinite';
import { EsoPayInlineError } from '@/esopay/components/EsoPayInlineError';
import { EsoPayFilterChips } from '@/esopay/components/EsoPayFilterChips';
import { LedgerEmptyState, LedgerSkeletonList } from '@/esopay/components/LedgerListStates';
import { toEsoPayApiError } from '@/esopay/api/client';
import { WalletLedgerRow } from '@/esopay/components/WalletLedgerRow';
import { ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { grid } from '@/esopay/theme/homeGrid';

type HistoryFilter = 'ALL' | 'BILLS' | 'WALLET' | 'AIRTIME';

const FILTERS: readonly HistoryFilter[] = ['ALL', 'BILLS', 'WALLET', 'AIRTIME'];

const FILTER_TO_CATEGORY: Record<HistoryFilter, WalletTransactionCategory> = {
  ALL: 'all',
  BILLS: 'bills',
  WALLET: 'wallet',
  AIRTIME: 'airtime',
};

const FILTER_LABELS: Record<HistoryFilter, string> = {
  ALL: 'All',
  BILLS: 'Bills',
  WALLET: 'Wallet',
  AIRTIME: 'Airtime',
};

export function HistoryScreen() {
  const goBack = useEsoPayBack();
  const scrollPad = useEsoPayScrollPadding({ tabBar: false });
  const [filter, setFilter] = useState<HistoryFilter>('ALL');
  const category = FILTER_TO_CATEGORY[filter];

  const ledgerQuery = useWalletTransactionsInfinite({ limit: 30, category });

  const rows = useMemo(
    () => ledgerQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [ledgerQuery.data?.pages],
  );

  const total = ledgerQuery.data?.pages[0]?.total ?? rows.length;

  const sections = useMemo(() => {
    const grouped = new Map<string, EsoPayWalletTransaction[]>();
    for (const row of rows) {
      const key = format(new Date(row.created_at), 'd MMMM yyyy');
      const bucket = grouped.get(key) ?? [];
      bucket.push(row);
      grouped.set(key, bucket);
    }
    return Array.from(grouped.entries()).map(([title, data]) => ({ title, data }));
  }, [rows]);

  const onRefresh = useCallback(() => {
    void ledgerQuery.refetch();
  }, [ledgerQuery]);

  const loadMore = useCallback(() => {
    if (!ledgerQuery.hasNextPage || ledgerQuery.isFetchingNextPage) return;
    void ledgerQuery.fetchNextPage();
  }, [ledgerQuery]);

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title="History" canGoBack onBack={goBack} />
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: scrollPad.paddingBottom, paddingTop: grid.sm },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={ledgerQuery.isFetching && !ledgerQuery.isLoading}
            onRefresh={onRefresh}
            tintColor={ESO_PAY_TEXT_SECONDARY}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <>
            <Text style={styles.count}>
              {rows.length > 0 ? `${rows.length} of ${total} transactions` : ' '}
            </Text>
            <View style={styles.filters}>
              <EsoPayFilterChips
                options={FILTERS}
                value={filter}
                onChange={(next) => setFilter(next as HistoryFilter)}
                labels={FILTER_LABELS}
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.sectionRows}>
              {item.data.map((tx) => (
                <WalletLedgerRow key={tx.id} transaction={tx} />
              ))}
            </View>
          </View>
        )}
        ListFooterComponent={
          ledgerQuery.isFetchingNextPage ? (
            <ActivityIndicator color={ESO_PAY_TEXT_SECONDARY} style={styles.footerLoader} />
          ) : ledgerQuery.hasNextPage ? (
            <Pressable onPress={loadMore} style={styles.loadMore}>
              <Text style={styles.loadMoreText}>Load more</Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          ledgerQuery.isLoading ? (
            <LedgerSkeletonList rows={5} />
          ) : ledgerQuery.isError ? (
            <EsoPayInlineError
              message={
                toEsoPayApiError(ledgerQuery.error).message ||
                'We could not load your transaction history.'
              }
              onRetry={() => void ledgerQuery.refetch()}
            />
          ) : (
            <LedgerEmptyState />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: grid.sm,
    gap: grid.md,
    flexGrow: 1,
  },
  count: {
    fontFamily: ds.font.caption,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ESO_PAY_TEXT_SECONDARY,
    marginBottom: grid.md,
    minHeight: 16,
  },
  filters: {
    marginBottom: grid.md,
  },
  section: {
    gap: grid.sm,
    marginBottom: grid.md,
  },
  sectionTitle: {
    fontFamily: ds.font.label,
    fontSize: 11,
    letterSpacing: 1.2,
    color: ESO_PAY_TEXT_SECONDARY,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  sectionRows: {
    gap: 0,
  },
  footerLoader: {
    marginVertical: grid.md,
  },
  loadMore: {
    alignItems: 'center',
    paddingVertical: grid.md,
  },
  loadMoreText: {
    fontFamily: ds.font.bodyStrong,
    fontSize: 14,
    color: ESO_PAY_TEXT_SECONDARY,
  },
});
