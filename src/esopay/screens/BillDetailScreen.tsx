import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  useBillDetail,
  useCanPayBillFromWallet,
  useInverterOffsets,
  usePaymentHistory,
  useWallet,
} from '@/esopay/api/hooks/useBilling';
import { canInitiateEsoPayPayment } from '@/esopay/context/roles';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { esopayPayBillHref } from '@/esopay/navigation/routes';
import { BalanceDisplay } from '@/esopay/components/BalanceDisplay';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { EsoPaySection } from '@/esopay/components/EsoPaySection';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';
import { OffsetBreakdownRow } from '@/esopay/components/OffsetBreakdownRow';
import { PaymentHistoryRow } from '@/esopay/components/PaymentHistoryRow';
import { StatusBadge } from '@/esopay/components/StatusBadge';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { formatBillPeriod } from '@/esopay/utils/billUi';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  billId: string;
};

function SummaryLine({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, emphasis && styles.summaryEmphasis]}>{value}</Text>
    </View>
  );
}

export function BillDetailScreen({ billId }: Props) {
  const router = useRouter();
  const host = useEsoPayHost();
  const billQuery = useBillDetail(billId);
  const offsetsQuery = useInverterOffsets(billId);
  const paymentsQuery = usePaymentHistory(billId);
  const walletQuery = useWallet();

  const bill = billQuery.data;
  const { canPay, shortfallKobo } = useCanPayBillFromWallet(bill);
  const canInitiate = canInitiateEsoPayPayment(host.userRole);

  const showPayActions = useMemo(() => {
    if (!bill) return false;
    if (bill.status === 'paid' || bill.status === 'void' || bill.status === 'payment_initiated') {
      return false;
    }
    return bill.status === 'pending' || bill.status === 'overdue' || bill.status === 'offset_calculated';
  }, [bill]);

  const onRefresh = useCallback(() => {
    void billQuery.refetch();
    void offsetsQuery.refetch();
    void paymentsQuery.refetch();
    void walletQuery.refetch();
  }, [billQuery, offsetsQuery, paymentsQuery, walletQuery]);

  const goBack = useCallback(() => router.back(), [router]);

  const onPrimaryAction = useCallback(() => {
    if (!canInitiate || !canPay) return;
    router.push(esopayPayBillHref(billId));
  }, [billId, canInitiate, canPay, router]);

  if (billQuery.isLoading && !bill) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader title="Bill" canGoBack onBack={goBack} />
        <View style={styles.loader}>
          <ActivityIndicator color={T.color.gold.primary} size="large" />
        </View>
      </EsoPayScreenShell>
    );
  }

  if (billQuery.isError || !bill) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader title="Bill" canGoBack onBack={goBack} />
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>This bill could not be loaded.</Text>
          <GoldCTAButton label="Retry" onPress={onRefresh} />
        </View>
      </EsoPayScreenShell>
    );
  }

  const primaryLabel = !canInitiate
    ? 'Payment requires admin access'
    : canPay
      ? `Pay ${formatCurrency(bill.net_amount_kobo, bill.currency)} from Wallet`
      : 'Insufficient wallet balance';

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title="Bill Detail" canGoBack onBack={goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={billQuery.isFetching && !billQuery.isLoading}
            onRefresh={onRefresh}
            tintColor={T.color.gold.primary}
          />
        }
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleBlock}>
              <Text style={styles.utility}>{bill.utility_provider}</Text>
              <Text style={styles.period}>
                {formatBillPeriod(bill.billing_period_start, bill.billing_period_end)}
              </Text>
              <Text style={styles.account}>Acct {bill.account_number}</Text>
            </View>
            <StatusBadge status={bill.status} />
          </View>

          <SummaryLine label="Gross" value={formatCurrency(bill.gross_amount_kobo, bill.currency)} />
          <SummaryLine
            label="Inverter offset"
            value={`− ${formatCurrency(bill.offset_amount_kobo, bill.currency)}`}
          />
          <View style={styles.divider} />
          <SummaryLine
            label="Net due"
            value={formatCurrency(bill.net_amount_kobo, bill.currency)}
            emphasis
          />
        </View>

        <EsoPaySection title="Wallet">
          <View style={styles.walletRow}>
            <BalanceDisplay
              label="Available balance"
              amountKobo={walletQuery.data?.balance_kobo ?? 0}
              currency={bill.currency}
              loading={walletQuery.isLoading}
              variant="emphasis"
              style={styles.walletCol}
            />
            <BalanceDisplay
              label="Bill net"
              amountKobo={bill.net_amount_kobo}
              currency={bill.currency}
              caption={canPay ? 'Covered' : `Short ${formatCurrency(shortfallKobo, bill.currency)}`}
              variant={canPay ? 'default' : 'warning'}
              style={styles.walletCol}
            />
          </View>
        </EsoPaySection>

        <EsoPaySection title="Inverter offsets">
          {offsetsQuery.isLoading ? (
            <ActivityIndicator color={T.color.gold.primary} />
          ) : offsetsQuery.data?.length ? (
            offsetsQuery.data.map((offset) => (
              <OffsetBreakdownRow key={offset.id} offset={offset} />
            ))
          ) : (
            <Text style={styles.muted}>No offset records for this billing period.</Text>
          )}
        </EsoPaySection>

        <EsoPaySection title="Payment history">
          {paymentsQuery.isLoading ? (
            <ActivityIndicator color={T.color.gold.primary} />
          ) : paymentsQuery.data?.length ? (
            paymentsQuery.data.map((payment) => (
              <PaymentHistoryRow
                key={payment.id}
                amountKobo={payment.amount_kobo}
                currency={payment.currency}
                status={payment.status}
                reference={payment.monnify_payment_reference}
                createdAt={payment.created_at}
                failureMessage={payment.failure_message}
              />
            ))
          ) : (
            <Text style={styles.muted}>No payments recorded yet.</Text>
          )}
        </EsoPaySection>

        {showPayActions ? (
          <View style={styles.ctaBlock}>
            <GoldCTAButton
              label={primaryLabel}
              onPress={onPrimaryAction}
              isDisabled={!canInitiate || !canPay}
            />
            {!canInitiate ? (
              <Text style={styles.roleHint}>Contact an owner or admin to settle this bill.</Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: T.layout.screenMargin,
    paddingBottom: T.spacing['6xl'],
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flex: 1,
    padding: T.layout.screenMargin,
    justifyContent: 'center',
    gap: T.spacing.lg,
  },
  errorText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.red.alert,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: T.color.bg.surface,
    borderRadius: T.radius.md,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    padding: T.spacing.xl,
    marginTop: T.spacing.lg,
    marginBottom: T.spacing.xxl,
    ...T.shadow.card,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: T.spacing.md,
    marginBottom: T.spacing.lg,
  },
  summaryTitleBlock: {
    flex: 1,
  },
  utility: {
    fontFamily: esopayFonts.heading,
    fontSize: T.type.h1.size,
    color: T.color.text.primary,
  },
  period: {
    marginTop: T.spacing.xs,
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.text.secondary,
  },
  account: {
    marginTop: 2,
    fontFamily: esopayFonts.mono,
    fontSize: T.type.caption.size,
    color: T.color.text.disabled,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: T.spacing.sm,
  },
  summaryLabel: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.text.secondary,
  },
  summaryValue: {
    fontFamily: esopayFonts.mono,
    fontSize: T.type.body.size,
    color: T.color.text.primary,
  },
  summaryEmphasis: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.h2.size,
    color: T.color.gold.shimmer,
  },
  divider: {
    height: 1,
    backgroundColor: T.color.border.subtle,
    marginVertical: T.spacing.md,
  },
  walletRow: {
    flexDirection: 'row',
    gap: T.spacing.sm,
  },
  walletCol: {
    flex: 1,
  },
  muted: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.text.secondary,
  },
  ctaBlock: {
    gap: T.spacing.sm,
    marginTop: T.spacing.md,
  },
  roleHint: {
    textAlign: 'center',
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
  },
});
