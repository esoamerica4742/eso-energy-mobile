import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { Receipt, Search } from 'lucide-react-native';
import {
  useRecentUtilityPayments,
  useUtilityProviders,
  useWallet,
} from '@/esopay/api/hooks/useBilling';
import { BillHistoryRow } from '@/esopay/components/bills/BillHistoryRow';
import { BillsHubActions } from '@/esopay/components/bills/BillsHubActions';
import { BillsPayAgainStrip } from '@/esopay/components/bills/BillsPayAgainStrip';
import { BillsHistorySkeleton } from '@/esopay/components/bills/BillsHistorySkeleton';
import {
  BILL_HUB_CARDS,
  BILL_HUB_GROUPS,
  type BillPayHubCardConfig,
  resolveBillHubGroupCards,
} from '@/esopay/data/billPayHubCatalog';
import { normalizeUtilityCategorySlug, slugFromFilterTab } from '@/esopay/data/nigeriaBillers';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import {
  BILL_HISTORY_FILTERS,
  type BillHistoryFilter,
  type BillHistoryRowModel,
  matchesBillHistoryFilter,
  recentPaymentToHistoryRow,
} from '@/esopay/lib/billHistoryDisplay';
import { getBillPayCardHelper, getQuickActionHelper } from '@/esopay/lib/billPayCardHelpers';
import { pickPayAgainRows } from '@/esopay/lib/billsPayAgain';
import {
  resolvePopularHubBillers,
} from '@/esopay/lib/resolvePopularHubBillers';
import {
  searchPayHubProviders,
  searchPayHubServices,
  type PayHubProviderHit,
} from '@/esopay/lib/searchPayHub';
import { normalizeBillCategory } from '@/esopay/navigation/billCategories';
import { esopayUtilityCategoryHref } from '@/esopay/navigation/routes';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { useQuickPayInsights } from '@/esopay/hooks/useQuickPayInsights';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import {
  ESO_PAY_BG,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { fonts } from '@/esopay/theme/typography';
import { inter } from '@/theme/fonts';
import { grid } from '@/esopay/theme/homeGrid';
import { formatCurrency } from '@/esopay/utils/currency';

const H_PAD = 16;
const HISTORY_FETCH_LIMIT = 80;
const HISTORY_VISIBLE_INITIAL = 12;
const HISTORY_VISIBLE_STEP = 15;

function hubCardSubtitle(card: BillPayHubCardConfig): string {
  return card.slug ? getBillPayCardHelper(card.slug) : getQuickActionHelper(card.key);
}

function QuietSearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.searchWrap}>
      <Search size={18} color={ESO_PAY_TEXT_SECONDARY} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search"
        placeholderTextColor={ds.color.textDisabled}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    </View>
  );
}

function HistoryBlock({
  rows,
  onRepeat,
  emptyLabel,
  canLoadMore,
  onLoadMore,
  remainingCount,
}: {
  rows: BillHistoryRowModel[];
  onRepeat: (row: BillHistoryRowModel) => void;
  emptyLabel: string;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  remainingCount?: number;
}) {
  if (rows.length === 0) {
    return (
      <View style={styles.emptyHistory}>
        <View style={styles.emptyIconRing}>
          <Receipt size={22} color={ESO_PAY_TEXT_SECONDARY} strokeWidth={1.8} />
        </View>
        <Text style={styles.emptyHistoryTitle}>No payments yet</Text>
        <Text style={styles.emptyHistoryText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <>
      {rows.map((item, index) => (
        <BillHistoryRow
          key={item.id}
          item={item}
          showDivider={index < rows.length - 1 || Boolean(canLoadMore)}
          onPress={onRepeat}
        />
      ))}
      {canLoadMore && onLoadMore ? (
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onLoadMore();
          }}
          style={({ pressed }) => [styles.loadMore, pressed && styles.loadMorePressed]}
          accessibilityRole="button"
          accessibilityLabel={`Load ${remainingCount ?? ''} more transactions`.trim()}
        >
          <Text style={styles.loadMoreText}>
            Load more
            {remainingCount != null && remainingCount > 0 ? ` (${remainingCount})` : ''}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}

export function BillsScreen() {
  const router = useRouter();
  const { openPayment } = usePaymentModal();
  const params = useLocalSearchParams<{ category?: string }>();
  const scrollPad = useEsoPayScrollPadding({ topExtra: 8 });
  const {
    predictiveNudge,
    predictiveAction,
    refresh: refreshInsights,
  } = useQuickPayInsights();

  const [query, setQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<BillHistoryFilter>('ALL');
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [historyVisibleCount, setHistoryVisibleCount] = useState(HISTORY_VISIBLE_INITIAL);

  const recentQuery = useRecentUtilityPayments({ limit: HISTORY_FETCH_LIMIT });
  const providersQuery = useUtilityProviders({ forceSync: true });
  const walletQuery = useWallet();
  const showInitialSkeleton = recentQuery.isPending && recentQuery.data === undefined;

  useFocusEffect(
    useCallback(() => {
      void recentQuery.refetch();
      void providersQuery.refetch();
      void walletQuery.refetch();
      void refreshInsights();
    }, [recentQuery, providersQuery, walletQuery, refreshInsights]),
  );

  useFocusEffect(
    useCallback(() => {
      const fromLegacy = normalizeBillCategory(params.category);
      const slug =
        normalizeUtilityCategorySlug(
          Array.isArray(params.category) ? params.category[0] : params.category,
        ) ?? (fromLegacy ? slugFromFilterTab(fromLegacy) : null);
      if (slug) {
        router.replace(esopayUtilityCategoryHref(slug));
      }
    }, [params.category, router]),
  );

  const allHistoryRows = useMemo(
    () => (recentQuery.data ?? []).map(recentPaymentToHistoryRow),
    [recentQuery.data],
  );

  const payAgainRows = useMemo(() => pickPayAgainRows(allHistoryRows), [allHistoryRows]);

  const popularItems = useMemo(
    () => resolvePopularHubBillers(providersQuery.data),
    [providersQuery.data],
  );

  const balanceKobo = walletQuery.data?.balance_kobo;

  const filteredHistory = useMemo(
    () => allHistoryRows.filter((row) => matchesBillHistoryFilter(row, historyFilter)),
    [allHistoryRows, historyFilter],
  );

  const visibleHistory = useMemo(
    () => filteredHistory.slice(0, historyVisibleCount),
    [filteredHistory, historyVisibleCount],
  );

  const historyRemaining = filteredHistory.length - visibleHistory.length;

  useEffect(() => {
    setHistoryVisibleCount(HISTORY_VISIBLE_INITIAL);
  }, [historyFilter]);

  const isSearching = query.trim().length > 0;

  const filteredHubCards = useMemo(
    () => searchPayHubServices(BILL_HUB_CARDS, query, hubCardSubtitle),
    [query],
  );

  const providerSearchHits = useMemo(
    () =>
      isSearching
        ? searchPayHubProviders(query, providersQuery.data, popularItems)
        : [],
    [isSearching, popularItems, providersQuery.data, query],
  );

  const openService = useCallback(
    (card: BillPayHubCardConfig) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!card.slug) return;
      router.push(esopayUtilityCategoryHref(card.slug));
    },
    [router],
  );

  const hubSections = useMemo(() => {
    if (isSearching) {
      if (filteredHubCards.length === 0) return [];
      return [{ id: 'results', title: 'Results', cards: filteredHubCards }];
    }

    return BILL_HUB_GROUPS.map((group) => {
      const cards = resolveBillHubGroupCards(group).filter((c) =>
        filteredHubCards.some((f) => f.key === c.key),
      );
      return { id: group.id, title: group.title, cards };
    }).filter((s) => s.cards.length > 0);
  }, [filteredHubCards, isSearching]);

  const repeatPayment = useCallback(
    (row: BillHistoryRowModel) => {
      openPayment({
        provider: row.payment.provider,
        accountNumber: row.payment.account_number,
        amountKobo: row.payment.amount_kobo,
      });
    },
    [openPayment],
  );

  const openProviderHit = useCallback(
    (hit: PayHubProviderHit) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(esopayUtilityCategoryHref(hit.slug, { billerCode: hit.billerCode }));
    },
    [router],
  );

  const runPredictivePay = useCallback(() => {
    if (!predictiveAction) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openPayment({
      provider: predictiveAction.provider,
      accountNumber: predictiveAction.accountNumber,
      amountKobo: predictiveAction.amountKobo,
    });
  }, [openPayment, predictiveAction]);

  const onRefresh = useCallback(() => {
    setPullRefreshing(true);
    void Promise.all([
      recentQuery.refetch(),
      providersQuery.refetch(),
      walletQuery.refetch(),
      refreshInsights(),
    ]).finally(() => {
      setPullRefreshing(false);
    });
  }, [recentQuery, providersQuery, walletQuery, refreshInsights]);

  const historyEmptyLabel =
    historyFilter === 'ALL'
      ? 'Your completed utility payments will appear here. Choose a service above to get started.'
      : `No ${BILL_HISTORY_FILTERS.find((f) => f.key === historyFilter)?.label.toLowerCase() ?? 'matching'} payments in this view yet.`;

  return (
    <EsoPayScreenShell>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: scrollPad.paddingTop,
            paddingBottom: scrollPad.paddingBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
        contentInsetAdjustmentBehavior="never"
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onRefresh}
            tintColor={ESO_PAY_TEXT_SECONDARY}
            colors={[ESO_PAY_TEXT_SECONDARY]}
            progressBackgroundColor={ESO_PAY_BG}
          />
        }
      >
        <View style={[styles.header, styles.padded]}>
          <Text style={styles.headerTitle}>Pay</Text>
          {balanceKobo != null ? (
            <Text style={styles.balanceGlance}>
              Balance {formatCurrency(balanceKobo)}
            </Text>
          ) : null}
        </View>

        <View style={styles.padded}>
          <QuietSearchBar value={query} onChangeText={setQuery} />
        </View>

        {(predictiveAction || predictiveNudge) && !isSearching ? (
          <View style={styles.padded}>
            <Pressable
              onPress={predictiveAction ? runPredictivePay : undefined}
              disabled={!predictiveAction}
              style={({ pressed }) => [
                styles.nudgeOuter,
                predictiveAction && styles.nudgePressable,
                pressed && predictiveAction && styles.nudgePressed,
              ]}
              accessibilityRole={predictiveAction ? 'button' : undefined}
              accessibilityLabel={
                predictiveAction
                  ? `${predictiveAction.label}. Tap to pay`
                  : predictiveNudge ?? undefined
              }
            >
              <Text style={styles.nudgeText}>
                {predictiveAction?.label ?? predictiveNudge}
              </Text>
              {predictiveAction ? (
                <Text style={styles.nudgeCta}>Pay now</Text>
              ) : null}
            </Pressable>
          </View>
        ) : null}

        <View style={[styles.padded, styles.servicesBlock]}>
          {hubSections.map((section) => (
            <View key={section.id} style={styles.serviceSection}>
              <Text style={styles.serviceSectionTitle}>{section.title}</Text>
              {section.id === 'services' && !isSearching ? (
                <Text style={styles.cashbackHint}>Earn up to 1% back on electricity</Text>
              ) : null}
              <BillsHubActions cards={section.cards} onSelect={openService} />
            </View>
          ))}
          {isSearching && providerSearchHits.length > 0 ? (
            <View style={styles.providerHits}>
              <Text style={styles.serviceSectionTitle}>Providers</Text>
              {providerSearchHits.map((hit) => (
                <Pressable
                  key={hit.id}
                  onPress={() => openProviderHit(hit)}
                  style={({ pressed }) => [
                    styles.providerHitRow,
                    pressed && styles.providerHitPressed,
                  ]}
                >
                  <View style={styles.providerHitCopy}>
                    <Text style={styles.providerHitTitle}>{hit.title}</Text>
                    <Text style={styles.providerHitSub} numberOfLines={1}>
                      {hit.subtitle}
                    </Text>
                  </View>
                  <Text style={styles.providerHitSlug}>{hit.slug}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {filteredHubCards.length === 0 && providerSearchHits.length === 0 ? (
            <Text style={styles.emptySearch}>No services or providers match your search.</Text>
          ) : null}
        </View>

        {!isSearching ? (
          <View style={[styles.section, styles.padded]}>
            <BillsPayAgainStrip rows={payAgainRows} onRepeat={repeatPayment} />
          </View>
        ) : null}

        <View style={[styles.section, styles.padded]}>
          <EsoPaySectionLabel>Transactions</EsoPaySectionLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {BILL_HISTORY_FILTERS.map((filter) => {
              const active = historyFilter === filter.key;
              const count =
                filter.key === 'ALL'
                  ? allHistoryRows.length
                  : allHistoryRows.filter((r) => matchesBillHistoryFilter(r, filter.key)).length;
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setHistoryFilter(filter.key);
                  }}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {filter.label}
                    {count > 0 ? ` · ${count}` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.txList}>
            {showInitialSkeleton ? (
              <BillsHistorySkeleton />
            ) : (
              <HistoryBlock
                rows={visibleHistory}
                onRepeat={repeatPayment}
                emptyLabel={historyEmptyLabel}
                canLoadMore={historyRemaining > 0}
                remainingCount={historyRemaining}
                onLoadMore={() =>
                  setHistoryVisibleCount((n) =>
                    Math.min(n + HISTORY_VISIBLE_STEP, filteredHistory.length),
                  )
                }
              />
            )}
          </View>
        </View>
      </ScrollView>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: ESO_PAY_BG,
  },
  scrollContent: {
    gap: grid.md,
  },
  padded: {
    paddingHorizontal: H_PAD,
  },
  header: {
    paddingTop: 4,
    gap: 4,
  },
  headerTitle: {
    fontFamily: inter.bold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  balanceGlance: {
    fontFamily: inter.medium,
    fontSize: 13,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  nudgeOuter: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  nudgePressable: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  nudgePressed: {
    opacity: 0.88,
  },
  nudgeText: {
    fontFamily: inter.regular,
    fontSize: 13,
    lineHeight: 18,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  nudgeCta: {
    fontFamily: inter.semibold,
    fontSize: 13,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  cashbackHint: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
    marginTop: -4,
  },
  providerHits: {
    gap: 8,
  },
  providerHitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  providerHitPressed: {
    opacity: 0.88,
  },
  providerHitCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  providerHitTitle: {
    fontFamily: inter.medium,
    fontSize: 14,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  providerHitSub: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  providerHitSlug: {
    fontFamily: inter.medium,
    fontSize: 11,
    color: ESO_PAY_TEXT_SECONDARY,
    textTransform: 'capitalize',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInput: {
    flex: 1,
    fontFamily: inter.regular,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
    padding: 0,
  },
  servicesBlock: {
    gap: grid.md,
  },
  serviceSection: {
    gap: grid.sm,
  },
  serviceSectionTitle: {
    fontFamily: inter.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  emptySearch: {
    fontFamily: inter.regular,
    fontSize: 14,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
    paddingVertical: 8,
  },
  section: {
    gap: 8,
  },
  txList: {
    marginTop: 4,
  },
  loadMore: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadMorePressed: {
    opacity: 0.85,
  },
  loadMoreText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  filterText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  filterTextActive: { color: ESO_PAY_TEXT_PRIMARY },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  emptyIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 4,
  },
  emptyHistoryTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  emptyHistoryText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 19,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
  },
});
