import { useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useEsoPayBack } from '@/esopay/navigation/useEsoPayBack';
import { useRecentUtilityPayments } from '@/esopay/api/hooks/useBilling';
import { BillHistoryRow } from '@/esopay/components/bills/BillHistoryRow';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { EsoPayInlineError } from '@/esopay/components/EsoPayInlineError';
import { LedgerEmptyState, LedgerSkeletonList } from '@/esopay/components/LedgerListStates';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { toEsoPayApiError } from '@/esopay/api/client';
import {
  recentPaymentToHistoryRow,
  type BillHistoryRowModel,
} from '@/esopay/lib/billHistoryDisplay';
import { maskAccountNumber } from '@/esopay/lib/resolveTrustedPaymentTarget';
import { formatPhoneDisplay } from '@/esopay/lib/telecomNetworks';
import {
  normalizeUtilityCategorySlug,
  UTILITY_CATEGORY_META,
  type UtilityCategorySlug,
} from '@/esopay/data/nigeriaBillers';
import { ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { grid } from '@/esopay/theme/homeGrid';

function formatPaidAt(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM yyyy · HH:mm');
  } catch {
    return iso;
  }
}

function cleanProviderLabel(name: string, slug: UtilityCategorySlug): string {
  if (slug === 'electricity') {
    return name
      .replace(/\s*\([^)]+\)\s*$/, '')
      .replace(/\s+(Prepaid|Postpaid)\s*$/i, '')
      .trim();
  }
  if (slug === 'data') {
    return name.split('—')[0]?.trim() || name;
  }
  return name;
}

function toCategoryHistoryRow(
  payment: BillHistoryRowModel['payment'],
  slug: UtilityCategorySlug,
): BillHistoryRowModel {
  const base = recentPaymentToHistoryRow(payment);
  const account =
    slug === 'airtime' || slug === 'data'
      ? formatPhoneDisplay(payment.account_number)
      : maskAccountNumber(payment.account_number);
  return {
    ...base,
    serviceName: cleanProviderLabel(payment.provider.name, slug) || payment.provider.name,
    dateTime: `${account} · ${formatPaidAt(payment.paid_at)}`,
  };
}

const TITLES: Partial<Record<UtilityCategorySlug, string>> = {
  electricity: 'Electricity history',
  airtime: 'Airtime history',
  data: 'Data history',
};

export function CategoryUtilityHistoryScreen() {
  const goBack = useEsoPayBack();
  const params = useLocalSearchParams<{ category?: string }>();
  const slug = normalizeUtilityCategorySlug(
    Array.isArray(params.category) ? params.category[0] : params.category,
  );
  const scrollPad = useEsoPayScrollPadding({ tabBar: false });
  const { openPayment } = usePaymentModal();
  const recentQuery = useRecentUtilityPayments({ limit: 80 });

  const rows = useMemo(() => {
    if (!slug) return [];
    return (recentQuery.data ?? [])
      .filter((row) => row.provider.category === slug)
      .map((row) => toCategoryHistoryRow(row, slug));
  }, [recentQuery.data, slug]);

  const onRefresh = useCallback(() => {
    void recentQuery.refetch();
  }, [recentQuery]);

  const onRepeat = useCallback(
    (row: BillHistoryRowModel) => {
      openPayment({
        provider: row.payment.provider,
        accountNumber: row.payment.account_number,
        amountKobo: row.payment.amount_kobo,
      });
    },
    [openPayment],
  );

  if (!slug) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader title="History" canGoBack onBack={goBack} />
        <View style={styles.center}>
          <Text style={styles.error}>Unknown category.</Text>
        </View>
      </EsoPayScreenShell>
    );
  }

  const title = TITLES[slug] ?? `${UTILITY_CATEGORY_META[slug].title} history`;

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title={title} canGoBack onBack={goBack} />
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: scrollPad.paddingBottom, paddingTop: grid.sm },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={recentQuery.isFetching && !recentQuery.isLoading}
            onRefresh={onRefresh}
            tintColor={ESO_PAY_TEXT_SECONDARY}
          />
        }
        ListHeaderComponent={
          rows.length > 0 ? (
            <Text style={styles.count}>
              {rows.length} {UTILITY_CATEGORY_META[slug].title.toLowerCase()} payments
            </Text>
          ) : (
            <View style={styles.countSpacer} />
          )
        }
        renderItem={({ item, index }) => (
          <BillHistoryRow
            item={item}
            showDivider={index < rows.length - 1}
            onPress={onRepeat}
          />
        )}
        ListEmptyComponent={
          recentQuery.isLoading ? (
            <LedgerSkeletonList rows={5} />
          ) : recentQuery.isError ? (
            <EsoPayInlineError
              message={
                toEsoPayApiError(recentQuery.error).message ||
                'We could not load your payment history.'
              }
              onRetry={() => void recentQuery.refetch()}
            />
          ) : (
            <LedgerEmptyState
              title={`No ${UTILITY_CATEGORY_META[slug].title.toLowerCase()} payments yet`}
              body="Successful payments will show up here for quick pay again."
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  count: {
    fontFamily: ds.font.caption,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: grid.md,
  },
  countSpacer: {
    height: grid.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontFamily: ds.font.body,
    fontSize: 14,
    color: ESO_PAY_TEXT_SECONDARY,
  },
});
