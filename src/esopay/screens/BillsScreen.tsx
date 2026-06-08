import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Receipt, Search, Sparkles } from 'lucide-react-native';
import { useRecentUtilityPayments } from '@/esopay/api/hooks/useBilling';
import { BillHistoryRow } from '@/esopay/components/bills/BillHistoryRow';
import { BillPayCardGrid, type BillPayGridSection } from '@/esopay/components/bills/BillPayCardGrid';
import { BillsPayAgainStrip } from '@/esopay/components/bills/BillsPayAgainStrip';
import { BillsHistorySkeleton } from '@/esopay/components/bills/BillsHistorySkeleton';
import { BillsHubSkeleton } from '@/esopay/components/bills/BillsHubSkeleton';
import {
  BILL_HUB_CARDS,
  BILL_HUB_GROUPS,
  type BillPayHubCardConfig,
  resolveBillHubGroupCards,
} from '@/esopay/data/billPayHubCatalog';
import {
  normalizeUtilityCategorySlug,
  slugFromFilterTab,
} from '@/esopay/data/nigeriaBillers';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import {
  BILL_HISTORY_FILTERS,
  type BillHistoryFilter,
  type BillHistoryRowModel,
  matchesBillHistoryFilter,
  recentPaymentToHistoryRow,
} from '@/esopay/lib/billHistoryDisplay';
import { buildBillPayHubCardItems } from '@/esopay/lib/buildBillPayHubCardItems';
import { getBillPayCardHelper, getQuickActionHelper } from '@/esopay/lib/billPayCardHelpers';
import {
  buildHubHighlightMap,
  filterHubCards,
} from '@/esopay/lib/billHubHighlights';
import { filterPayAgainStrip, pickPayAgainRows } from '@/esopay/lib/billsPayAgain';
import { normalizeBillCategory } from '@/esopay/navigation/billCategories';
import { esopayUtilityCategoryHref } from '@/esopay/navigation/routes';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { useQuickPayInsights } from '@/esopay/hooks/useQuickPayInsights';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { luxury } from '@/esopay/theme/luxury';
import { fonts } from '@/esopay/theme/typography';

const H_PAD = 16;
const HISTORY_FETCH_LIMIT = 80;
const HISTORY_VISIBLE_INITIAL = 12;
const HISTORY_VISIBLE_STEP = 15;

function hubCardSubtitle(card: BillPayHubCardConfig): string {
  return card.slug ? getBillPayCardHelper(card.slug) : getQuickActionHelper(card.key);
}

function GlassSearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  const inner = (
    <>
      <Search size={18} color={luxury.gold} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search service..."
        placeholderTextColor={luxury.textDim}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    </>
  );

  if (Platform.OS !== 'ios') {
    return <View style={[styles.searchWrap, styles.searchFallback]}>{inner}</View>;
  }

  return (
    <View style={styles.searchOuter}>
      <BlurView intensity={28} tint="dark" style={styles.searchBlur}>
        <View style={styles.searchWrap}>{inner}</View>
      </BlurView>
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
          <Receipt size={26} color={luxury.gold} strokeWidth={1.8} />
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
            Load more{remainingCount != null && remainingCount > 0 ? ` (${remainingCount})` : ''}
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
  const { predictiveNudge, refresh: refreshInsights } = useQuickPayInsights();

  const [query, setQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<BillHistoryFilter>('ALL');
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [historyVisibleCount, setHistoryVisibleCount] = useState(HISTORY_VISIBLE_INITIAL);

  const recentQuery = useRecentUtilityPayments({ limit: HISTORY_FETCH_LIMIT });
  const showInitialSkeleton = recentQuery.isPending && recentQuery.data === undefined;

  useFocusEffect(
    useCallback(() => {
      void recentQuery.refetch();
      void refreshInsights();
    }, [recentQuery, refreshInsights]),
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

  const payAgainRows = useMemo(() => {
    const candidates = pickPayAgainRows(allHistoryRows);
    return filterPayAgainStrip(candidates, allHistoryRows);
  }, [allHistoryRows]);

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

  const hubHighlights = useMemo(
    () => buildHubHighlightMap(recentQuery.data ?? []),
    [recentQuery.data],
  );

  const isSearching = query.trim().length > 0;

  const filteredHubCards = useMemo(
    () => filterHubCards(BILL_HUB_CARDS, query, hubCardSubtitle),
    [query],
  );

  const openService = useCallback(
    (card: BillPayHubCardConfig) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!card.slug) return;
      router.push(esopayUtilityCategoryHref(card.slug));
    },
    [router],
  );

  const hubGridSections = useMemo((): BillPayGridSection[] => {
    if (isSearching) {
      const items = buildBillPayHubCardItems(filteredHubCards, openService, hubHighlights);
      if (items.length === 0) return [];
      return [{ id: 'results', title: 'Results', items }];
    }

    return BILL_HUB_GROUPS.map((group) => {
      const cards = resolveBillHubGroupCards(group).filter((c) =>
        filteredHubCards.some((f) => f.key === c.key),
      );
      return {
        id: group.id,
        title: group.title,
        items: buildBillPayHubCardItems(cards, openService, hubHighlights),
      };
    }).filter((s) => s.items.length > 0);
  }, [filteredHubCards, hubHighlights, isSearching, openService]);

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

  const onRefresh = useCallback(() => {
    setPullRefreshing(true);
    void Promise.all([recentQuery.refetch(), refreshInsights()]).finally(() => {
      setPullRefreshing(false);
    });
  }, [recentQuery, refreshInsights]);

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
          { paddingTop: scrollPad.paddingTop, paddingBottom: scrollPad.paddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
        contentInsetAdjustmentBehavior="never"
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onRefresh}
            tintColor={luxury.gold}
            colors={[luxury.gold]}
            progressBackgroundColor={luxury.bg}
          />
        }
      >
        <View style={[styles.header, styles.padded]}>
          <Text style={styles.headerTitle}>
            <Text style={styles.headerGold}>PAY UTILITIES</Text>
          </Text>
          <Text style={styles.headerSub}>What would you like to pay?</Text>
        </View>

        <View style={styles.padded}>
          <GlassSearchBar value={query} onChangeText={setQuery} />
        </View>

        {predictiveNudge && !isSearching ? (
          <View style={[styles.padded, styles.nudgeOuter]}>
            <LinearGradient
              colors={['rgba(212, 160, 23, 0.14)', 'rgba(212, 160, 23, 0.04)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Sparkles size={16} color={luxury.goldAccent} strokeWidth={2} />
            <Text style={styles.nudgeText}>{predictiveNudge}</Text>
          </View>
        ) : null}

        {showInitialSkeleton ? (
          <BillsHubSkeleton />
        ) : (
          <BillPayCardGrid sections={hubGridSections} embedded />
        )}

        {filteredHubCards.length === 0 && !showInitialSkeleton ? (
          <Text style={[styles.emptySearch, styles.padded]}>No services match your search.</Text>
        ) : null}

        {payAgainRows.length > 0 ? (
          <View style={[styles.section, styles.padded]}>
            <BillsPayAgainStrip rows={payAgainRows} onRepeat={repeatPayment} />
          </View>
        ) : null}

        <View style={[styles.section, styles.padded]}>
          <Text style={styles.sectionHeading}>Transaction history</Text>
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
          <View style={styles.txCard}>
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
    backgroundColor: luxury.bg,
  },
  scrollContent: {
    gap: 12,
  },
  padded: {
    paddingHorizontal: H_PAD,
  },
  header: {
    gap: 4,
    paddingTop: 4,
  },
  headerTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 26,
    letterSpacing: 0.6,
    color: luxury.textPrimary,
  },
  headerGold: {
    color: luxury.gold,
  },
  headerSub: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: luxury.warmWhite,
    opacity: 0.92,
  },
  nudgeOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.28)',
    overflow: 'hidden',
  },
  nudgeText: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    color: luxury.textPrimary,
  },
  searchOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: luxury.goldBorder,
  },
  searchBlur: {
    overflow: 'hidden',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: luxury.glass,
  },
  searchFallback: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    backgroundColor: luxury.glass,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: luxury.textPrimary,
    padding: 0,
  },
  emptySearch: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: luxury.textMuted,
    textAlign: 'center',
  },
  section: {
    gap: 8,
    marginTop: 4,
  },
  sectionHeading: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: luxury.warmWhite,
  },
  txCard: {
    backgroundColor: luxury.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.18)',
    padding: 16,
    overflow: 'hidden',
  },
  loadMore: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(212, 160, 23, 0.18)',
  },
  loadMorePressed: {
    opacity: 0.85,
  },
  loadMoreText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: luxury.goldAccent,
    letterSpacing: 0.2,
  },
  filterRow: { gap: 8, paddingVertical: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    backgroundColor: luxury.surface,
  },
  filterChipActive: {
    backgroundColor: luxury.goldDim,
    borderColor: luxury.gold,
  },
  filterText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: luxury.textMuted,
  },
  filterTextActive: { color: luxury.gold },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  emptyIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: luxury.goldDim,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.28)',
    marginBottom: 4,
  },
  emptyHistoryTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: luxury.textPrimary,
  },
  emptyHistoryText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 19,
    color: luxury.textMuted,
    textAlign: 'center',
  },
});
