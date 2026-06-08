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
import { useRouter } from 'expo-router';
import { useWalletTransactions } from '@/esopay/api/hooks/useBilling';
import type { EsoPayWalletTransaction, WalletTransactionCategory } from '@/esopay/api/types';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { WalletLedgerRow } from '@/esopay/components/WalletLedgerRow';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { Colors, FontSize } from '@/tokens/design';
import { fonts as appFonts } from '@/theme/tokens';

type HistoryFilter = 'ALL' | 'BILLS' | 'WALLET' | 'AIRTIME';

const FILTER_TO_CATEGORY: Record<HistoryFilter, WalletTransactionCategory> = {
  ALL: 'all',
  BILLS: 'bills',
  WALLET: 'wallet',
  AIRTIME: 'airtime',
};

export function HistoryScreen() {
  const router = useRouter();
  const scrollPad = useEsoPayScrollPadding({ tabBar: false });
  const [filter, setFilter] = useState<HistoryFilter>('ALL');
  const category = FILTER_TO_CATEGORY[filter];
  const ledgerQuery = useWalletTransactions({ page: 1, limit: 50, category });

  const sections = useMemo(() => {
    const rows = ledgerQuery.data?.data ?? [];
    const grouped = new Map<string, EsoPayWalletTransaction[]>();
    for (const row of rows) {
      const key = format(new Date(row.created_at), 'd MMMM yyyy');
      const bucket = grouped.get(key) ?? [];
      bucket.push(row);
      grouped.set(key, bucket);
    }
    return Array.from(grouped.entries()).map(([title, data]) => ({ title, data }));
  }, [ledgerQuery.data?.data]);

  const onRefresh = useCallback(() => {
    void ledgerQuery.refetch();
  }, [ledgerQuery]);

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title="History" canGoBack onBack={() => router.back()} />
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: scrollPad.paddingBottom, paddingTop: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={ledgerQuery.isFetching && !ledgerQuery.isLoading}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.title}>History</Text>
            <View style={styles.filters}>
              {(['ALL', 'BILLS', 'WALLET', 'AIRTIME'] as HistoryFilter[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setFilter(key)}
                  style={[styles.chip, filter === key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filter === key && styles.chipTextActive]}>
                    {key}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.data.map((tx) => (
              <WalletLedgerRow key={tx.id} transaction={tx} />
            ))}
          </View>
        )}
        ListEmptyComponent={
          ledgerQuery.isLoading ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
          ) : (
            <Text style={styles.empty}>No transactions yet.</Text>
          )
        }
      />
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontFamily: appFonts.bold,
    fontSize: FontSize.title,
    color: Colors.textPrimary,
    marginBottom: spacing.lg,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  chipActive: {
    backgroundColor: colors.goldGlow,
    borderColor: colors.gold,
  },
  chipText: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.gold,
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.goldDim,
    textTransform: 'uppercase',
  },
  empty: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
