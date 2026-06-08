import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useWallet, useWalletTransactions } from '@/esopay/api/hooks/useBilling';
import type { EsoPayWalletTransaction } from '@/esopay/api/types';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { esopayFundWalletHref } from '@/esopay/navigation/routes';
import { NumberTicker } from '@/esopay/components/NumberTicker';
import { Skeleton } from '@/esopay/components/Skeleton';
import { WalletLedgerRow } from '@/esopay/components/WalletLedgerRow';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type LedgerFilter = 'ALL' | 'CREDIT' | 'DEBIT';

export function WalletScreen() {
  const router = useRouter();
  const scrollPad = useEsoPayScrollPadding({ tabBar: false });
  const [hidden, setHidden] = useState(false);
  const [filter, setFilter] = useState<LedgerFilter>('ALL');
  const [page, setPage] = useState(1);

  const walletQuery = useWallet();
  const ledgerQuery = useWalletTransactions({ page, limit: 30 });

  const transactions = ledgerQuery.data?.data ?? [];
  const filtered = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    if (filter === 'CREDIT') return tx.type === 'credit' || tx.type === 'refund' || tx.type === 'reversal';
    return tx.type === 'debit' || tx.type === 'bill_payment';
  });

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const onRefresh = useCallback(() => {
    void walletQuery.refetch();
    void ledgerQuery.refetch();
  }, [ledgerQuery, walletQuery]);

  const renderTx = useCallback(
    ({ item }: { item: EsoPayWalletTransaction }) => (
      <WalletLedgerRow transaction={item} />
    ),
    [],
  );

  const balance = walletQuery.data?.balance_kobo ?? 0;

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title="Wallet" canGoBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: scrollPad.paddingBottom }]}
        refreshControl={
          <RefreshControl
            refreshing={ledgerQuery.isFetching && !ledgerQuery.isLoading}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
      >
        <Pressable
          style={({ pressed }) => [styles.fundBtn, pressed && styles.fundBtnPressed]}
          onPress={() => router.push(esopayFundWalletHref())}
        >
          <Text style={styles.fundBtnText}>Fund wallet</Text>
        </Pressable>

        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>Wallet Balance</Text>
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={12}>
            {hidden ? (
              <EyeOff size={20} color={colors.muted} />
            ) : (
              <Eye size={20} color={colors.gold} />
            )}
          </Pressable>
        </View>

        {walletQuery.isLoading ? (
          <Skeleton height={56} width="70%" />
        ) : hidden ? (
          <View style={styles.hiddenBalanceRow}>
            <Text style={styles.hiddenSymbol}>₦</Text>
            <Text style={styles.hiddenAmount}>••••••</Text>
          </View>
        ) : (
          <NumberTicker
            valueKobo={balance}
            alwaysDecimals
            style={styles.heroBalanceAmount}
            symbolStyle={styles.heroBalanceSymbol}
            containerStyle={styles.heroBalanceRow}
          />
        )}

        <View style={styles.filters}>
          {(['ALL', 'CREDIT', 'DEBIT'] as LedgerFilter[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[styles.filterChip, filter === key && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
                {key}
              </Text>
            </Pressable>
          ))}
        </View>

        {ledgerQuery.isLoading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.lg }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyBody}>Wallet activity will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderTx}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </ScrollView>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  fundBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.gold,
  },
  fundBtnPressed: {
    opacity: 0.9,
  },
  fundBtnText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.black,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  heroBalanceRow: {
    alignSelf: 'flex-start',
  },
  heroBalanceSymbol: {
    fontFamily: fonts.uiMedium,
    fontSize: 56,
    lineHeight: 60,
    color: colors.white,
  },
  heroBalanceAmount: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: 0,
    color: colors.white,
  },
  hiddenBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  hiddenSymbol: {
    fontFamily: fonts.uiMedium,
    fontSize: 56,
    lineHeight: 60,
    color: colors.white,
  },
  hiddenAmount: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 60,
    color: colors.white,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  filterChipActive: {
    backgroundColor: colors.goldGlow,
    borderColor: colors.gold,
  },
  filterText: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: colors.muted,
  },
  filterTextActive: {
    color: colors.gold,
  },
  separator: {
    height: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.white,
  },
  emptyBody: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
  },
});
