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
import { useRouter } from 'expo-router';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { formatDistanceToNow } from 'date-fns';
import { Receipt } from 'lucide-react-native';
import type { EsoPayBill } from '@/esopay/api/types';
import {
  useBillSummaryStats,
  useBillsList,
  useWallet,
  type BillFilters,
} from '@/esopay/api/hooks/useBilling';
import { esopayBillDetailHref } from '@/esopay/navigation/routes';
import { BillCard } from '@/esopay/components/BillCard';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { FilterChipBar, type BillFilterChip } from '@/esopay/components/FilterChipBar';
import { HeroStatCard } from '@/esopay/components/HeroStatCard';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';

export function BillsListScreen() {
  const router = useRouter();
  const scrollPad = useEsoPayScrollPadding({ tabBar: false });
  const [filter, setFilter] = useState<BillFilterChip>('all');

  const listFilters = useMemo<BillFilters | undefined>(
    () => (filter === 'all' ? undefined : { status: filter }),
    [filter],
  );

  const billsQuery = useBillsList(listFilters);
  const summaryQuery = useBillSummaryStats();
  const walletQuery = useWallet();

  const bills = billsQuery.data?.data ?? [];
  const refreshing = billsQuery.isFetching && !billsQuery.isLoading;

  const onRefresh = useCallback(() => {
    void billsQuery.refetch();
    void summaryQuery.refetch();
    void walletQuery.refetch();
  }, [billsQuery, summaryQuery, walletQuery]);

  const openBill = useCallback(
    (billId: string) => {
      router.push(esopayBillDetailHref(billId));
    },
    [router],
  );

  const staleLabel =
    billsQuery.dataUpdatedAt > 0
      ? `Updated ${formatDistanceToNow(billsQuery.dataUpdatedAt, { addSuffix: true })}`
      : null;

  const renderBill = useCallback(
    ({ item, index }: { item: EsoPayBill; index: number }) => (
      <BillCard bill={item} animationIndex={index} onPress={() => openBill(item.id)} />
    ),
    [openBill],
  );

  const listHeader = (
    <>
      <View style={styles.heroRow}>
        <HeroStatCard
          label="Outstanding"
          value={summaryQuery.data?.totalOutstandingKobo ?? 0}
          loading={summaryQuery.isLoading}
        />
        <View style={styles.heroGap} />
        <HeroStatCard
          label="Offset Savings"
          value={summaryQuery.data?.totalOffsetKobo ?? 0}
          loading={summaryQuery.isLoading}
          trend="up"
        />
        <View style={styles.heroGap} />
        <HeroStatCard
          label="Wallet"
          value={walletQuery.data?.balance_kobo ?? summaryQuery.data?.walletBalanceKobo ?? 0}
          loading={walletQuery.isLoading || summaryQuery.isLoading}
        />
      </View>

      <FilterChipBar value={filter} onChange={setFilter} />

      {staleLabel ? <Text style={styles.stale}>{staleLabel}</Text> : null}

      {billsQuery.isError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Unable to load bills. Pull to retry.</Text>
        </View>
      ) : null}
    </>
  );

  const emptyComponent = (
    <View style={styles.empty}>
      <Receipt size={T.icon.emptyState} color={T.color.gold.muted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No bills found</Text>
      <Text style={styles.emptyCaption}>
        Your utility payments and invoices will appear here.
      </Text>
    </View>
  );

  if (billsQuery.isLoading && bills.length === 0) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader
          title="Payment history"
          canGoBack
          onBack={() => router.back()}
        />
        <View style={styles.loader}>
          <ActivityIndicator color={T.color.gold.primary} size="large" />
        </View>
      </EsoPayScreenShell>
    );
  }

  return (
    <EsoPayScreenShell>
      <EsoPayHeader
        title="Payment history"
        canGoBack
        onBack={() => router.back()}
      />
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={renderBill}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={[styles.listContent, { paddingBottom: scrollPad.paddingBottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.color.gold.primary}
          />
        }
      />
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  heroRow: {
    flexDirection: 'row',
    paddingHorizontal: T.layout.screenMargin,
    paddingTop: T.spacing.md,
    paddingBottom: T.spacing.md,
  },
  heroGap: {
    width: T.spacing.sm,
  },
  stale: {
    paddingHorizontal: T.layout.screenMargin,
    paddingBottom: T.spacing.sm,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.disabled,
  },
  banner: {
    marginHorizontal: T.layout.screenMargin,
    marginBottom: T.spacing.md,
    padding: T.spacing.md,
    borderRadius: T.radius.sm,
    backgroundColor: `${T.color.red.alert}14`,
    borderWidth: 1,
    borderColor: `${T.color.red.alert}33`,
  },
  bannerText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.red.alert,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: T.layout.screenMargin,
    paddingTop: T.spacing['6xl'],
    gap: T.spacing.md,
  },
  emptyTitle: {
    fontFamily: esopayFonts.heading,
    fontSize: T.type.h3.size,
    color: T.color.text.primary,
  },
  emptyCaption: {
    textAlign: 'center',
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    lineHeight: T.type.body.lineHeight,
    color: T.color.text.secondary,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
