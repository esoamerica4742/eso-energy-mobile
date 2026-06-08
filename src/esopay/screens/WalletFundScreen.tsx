import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ESOPAY_LOGIN_ROUTE } from '@/lib/navigation/productRoutes';
import { useWallet, useWalletTransactions } from '@/esopay/api/hooks/useBilling';
import type { EsoPayWalletTransaction } from '@/esopay/api/types';
import { useFundWalletProvision } from '@/esopay/hooks/useFundWalletProvision';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { FundWalletAccountCard } from '@/esopay/components/FundWalletAccountCard';
import { WalletBalanceCard } from '@/esopay/components/WalletBalanceCard';
import { colors } from '@/esopay/theme/colors';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { formatCurrencyAmount } from '@/esopay/utils/currency';

type Props = {
  amountKobo?: number;
  billId?: string;
};

function formatLastFunded(iso: string | undefined): string {
  if (!iso) return 'No top-ups yet';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'No top-ups yet';

  const diffMs = Date.now() - then;
  if (diffMs < 60_000) return 'Last funded just now';
  if (diffMs < 3_600_000) {
    const mins = Math.max(1, Math.floor(diffMs / 60_000));
    return `Last funded ${mins}m ago`;
  }
  if (diffMs < 86_400_000) {
    const hrs = Math.max(1, Math.floor(diffMs / 3_600_000));
    return `Last funded ${hrs}h ago`;
  }
  return `Last funded ${new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
}

function formatTopUpRow(tx: EsoPayWalletTransaction): string {
  const when = new Date(tx.created_at);
  const time = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const date = when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${date} · ${time}`;
}

export function WalletFundScreen({ amountKobo }: Props) {
  const router = useRouter();
  const walletQuery = useWallet({ pollIntervalMs: 10_000, retry: false });
  const txQuery = useWalletTransactions({ page: 1, limit: 20 });
  const { reserved, error: reservedError, loading: reservedLoading, signedIn, retry } =
    useFundWalletProvision();
  const wallet = walletQuery.data;

  const recentTopUps = useMemo(
    () =>
      (txQuery.data?.data ?? [])
        .filter((tx) => tx.type === 'credit' && tx.status === 'success')
        .slice(0, 3),
    [txQuery.data?.data],
  );

  const balanceMeta = useMemo(
    () => formatLastFunded(recentTopUps[0]?.created_at),
    [recentTopUps],
  );

  const goBack = useCallback(() => router.back(), [router]);

  const onRefresh = useCallback(() => {
    void walletQuery.refetch();
    void txQuery.refetch();
    void retry();
  }, [retry, txQuery, walletQuery]);

  const targetLabel =
    amountKobo && amountKobo > 0
      ? `Transfer at least ${formatCurrencyAmount(amountKobo / 100, 'NGN')} to fund this payment`
      : 'Transfer any amount to top up your wallet';

  const showProvisionSpinner = reservedLoading && !reserved && !reservedError;

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title="Fund wallet" canGoBack onBack={goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={
              (walletQuery.isFetching && !walletQuery.isLoading) ||
              (reservedLoading && Boolean(reserved))
            }
            onRefresh={onRefresh}
            tintColor={T.color.gold.primary}
          />
        }
      >
        <WalletBalanceCard
          balanceKobo={wallet?.balance_kobo ?? 0}
          status={wallet?.status ?? 'active'}
          loading={walletQuery.isLoading && wallet == null}
          subtitle="Eso wallet · Monnify"
          subtitleEmphasis
          borderGlow
          balanceMeta={balanceMeta}
          style={styles.walletCard}
        />

        <Text style={styles.lead}>{targetLabel}</Text>

        {!signedIn ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>Sign in to Eso Pay to fund your wallet.</Text>
            <Pressable
              onPress={() => router.replace(ESOPAY_LOGIN_ROUTE as Href)}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Sign in</Text>
            </Pressable>
          </View>
        ) : showProvisionSpinner ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>Setting up your bank transfer account…</Text>
            <Text style={styles.loadingHint}>
              Usually under 20 seconds. If this fails, Monnify secrets may be missing on Supabase.
            </Text>
          </View>
        ) : reservedError ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>
              {reservedError.code === 'AUTH_SESSION_MISSING' ||
              reservedError.status === 401
                ? 'Your Eso Pay session expired or is missing. Sign in again with your email code.'
                : reservedError.code === 'MONNIFY_NOT_CONFIGURED'
                ? 'Monnify is not set up on the server. In Supabase → Edge Functions → Secrets, add MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE, and MONNIFY_ENV=sandbox, then redeploy eso-pay-api.'
                : reservedError.code === 'MONNIFY_AUTH_FAILED'
                  ? `Monnify rejected the server credentials: ${reservedError.message}`
                  : reservedError.code === 'PROVISION_TIMEOUT'
                    ? 'Bank setup timed out. Add Monnify secrets to Supabase (see below), redeploy eso-pay-api, then tap Try again.'
                    : reservedError.code === 'MONNIFY_KYC_REQUIRED'
                  ? reservedError.message
                  : reservedError.code === 'RESERVED_ACCOUNT_UNAVAILABLE'
                    ? reservedError.message ||
                      'Monnify could not create your virtual account. Check sandbox credentials and contract code, then tap Try again.'
                    : reservedError.message ||
                      'Could not load bank details. Tap Try again or contact support.'}
            </Text>
            <Pressable onPress={() => void retry()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
            {reservedError.code === 'AUTH_SESSION_MISSING' || reservedError.status === 401 ? (
              <Pressable
                onPress={() => router.replace(ESOPAY_LOGIN_ROUTE as Href)}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>Sign in again</Text>
              </Pressable>
            ) : null}
          </View>
        ) : reserved?.account_number ? (
          <>
            <FundWalletAccountCard account={reserved} />

            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Recent top-ups</Text>
              {recentTopUps.length === 0 ? (
                <Text style={styles.historyEmpty}>No top-ups yet — transfer to your account above.</Text>
              ) : (
                recentTopUps.map((tx) => (
                  <View key={tx.id} style={styles.historyRow}>
                    <Text style={styles.historyLabel} numberOfLines={1}>
                      {tx.narration?.trim() || 'Wallet credit'}
                    </Text>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyAmount}>
                        +{formatCurrencyAmount(tx.amount_kobo / 100, 'NGN')}
                      </Text>
                      <Text style={styles.historyWhen}>{formatTopUpRow(tx)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.error}>Bank transfer details are not ready yet.</Text>
            <Pressable onPress={() => void retry()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Set up account</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: T.layout.screenMargin,
    paddingBottom: T.spacing.xxxl,
    gap: T.spacing.lg,
  },
  walletCard: {
    marginTop: T.spacing.sm,
  },
  lead: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    lineHeight: T.type.body.lineHeight,
    color: T.color.text.secondary,
  },
  loadingBox: {
    alignItems: 'center',
    gap: T.spacing.md,
    paddingVertical: T.spacing.xl,
  },
  loadingText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.text.secondary,
    textAlign: 'center',
  },
  loadingHint: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    lineHeight: T.type.caption.lineHeight,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: T.spacing.md,
  },
  errorBox: {
    gap: T.spacing.md,
    paddingVertical: T.spacing.sm,
  },
  error: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: colors.danger,
    lineHeight: 22,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: T.spacing.lg,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  retryText: {
    fontFamily: esopayFonts.label,
    fontSize: 13,
    color: colors.gold,
  },
  historySection: {
    gap: T.spacing.sm,
    paddingTop: T.spacing.xs,
  },
  historyTitle: {
    fontFamily: esopayFonts.label,
    fontSize: T.type.caption.size,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: T.color.text.disabled,
  },
  historyEmpty: {
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    lineHeight: T.type.caption.lineHeight,
    color: T.color.text.disabled,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: T.spacing.md,
    paddingVertical: T.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.color.border.subtle,
  },
  historyLabel: {
    flex: 1,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.disabled,
  },
  historyMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historyAmount: {
    fontFamily: esopayFonts.mono,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
  },
  historyWhen: {
    fontFamily: esopayFonts.mono,
    fontSize: 10,
    color: T.color.text.disabled,
  },
});
