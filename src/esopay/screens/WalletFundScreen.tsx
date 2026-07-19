import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useEsoPayBack } from '@/esopay/navigation/useEsoPayBack';
import { ESOPAY_LOGIN_ROUTE } from '@/lib/navigation/productRoutes';
import { useWallet, useWalletTransactions } from '@/esopay/api/hooks/useBilling';
import type { EsoPayWalletTransaction } from '@/esopay/api/types';
import { EsoPayKycModal } from '@/esopay/components/EsoPayKycModal';
import { useEsoPayKyc } from '@/esopay/hooks/useEsoPayKyc';
import { useFundWalletProvision } from '@/esopay/hooks/useFundWalletProvision';
import { getMonnifyProvisionErrorMessage } from '@/esopay/lib/monnifyProvisionErrors';
import { formatWalletTransactionTitle } from '@/esopay/lib/formatWalletTransactionTitle';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { FundWalletAccountCard } from '@/esopay/components/FundWalletAccountCard';
import { MonnifyWalletCard } from '@/esopay/components/MonnifyWalletCard';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
  HOME_CARD_SURFACE,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { grid } from '@/esopay/theme/homeGrid';
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
  const time = when.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const date = when.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${date} · ${time}`;
}

export function WalletFundScreen({ amountKobo }: Props) {
  const router = useRouter();
  const walletQuery = useWallet({ pollIntervalMs: 10_000, retry: false });
  const txQuery = useWalletTransactions({ page: 1, limit: 20 });
  const {
    reserved,
    error: reservedError,
    loading: reservedLoading,
    signedIn,
    retry,
  } = useFundWalletProvision();
  const { saveKyc, saving: kycSaving, needsKyc } = useEsoPayKyc();
  const [kycOpen, setKycOpen] = useState(false);
  const wallet = walletQuery.data;
  const needsIdentity =
    needsKyc || reservedError?.code === 'MONNIFY_KYC_REQUIRED';

  useEffect(() => {
    if (needsIdentity) setKycOpen(true);
  }, [needsIdentity]);

  const recentTopUps = useMemo(
    () =>
      (txQuery.data?.data ?? [])
        .filter((tx) => tx.type === 'credit' && tx.status === 'success')
        .slice(0, 3),
    [txQuery.data?.data],
  );

  const goBack = useEsoPayBack();

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
  const balance = wallet?.balance_kobo ?? 0;
  const walletLoading = walletQuery.isLoading && wallet == null;

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title='Fund wallet' canGoBack onBack={goBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={
              (walletQuery.isFetching && !walletQuery.isLoading) ||
              (reservedLoading && Boolean(reserved))
            }
            onRefresh={onRefresh}
            tintColor={ESO_PAY_TEXT_SECONDARY}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <MonnifyWalletCard balanceKobo={balance} loading={walletLoading} stableDisplay />

        <Text style={styles.lead}>{targetLabel}</Text>
        {recentTopUps[0]?.created_at ? (
          <Text style={styles.meta}>{formatLastFunded(recentTopUps[0].created_at)}</Text>
        ) : null}

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
            <ActivityIndicator color={ESO_PAY_TEXT_SECONDARY} />
            <Text style={styles.loadingText}>Setting up your bank transfer account…</Text>
            <Text style={styles.loadingHint}>
              Usually under 20 seconds. If this fails, Monnify secrets may be missing on Supabase.
            </Text>
          </View>
        ) : reservedError ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{getMonnifyProvisionErrorMessage(reservedError)}</Text>
            {needsIdentity ? (
              <Pressable onPress={() => setKycOpen(true)} style={styles.retryBtn}>
                <Text style={styles.retryText}>Add BVN or NIN</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => void retry()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            )}
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
                <Text style={styles.historyEmpty}>
                  No top-ups yet — transfer to your account above.
                </Text>
              ) : (
                recentTopUps.map((tx) => (
                  <View key={tx.id} style={styles.historyRow}>
                    <Text style={styles.historyLabel} numberOfLines={1}>
                      {formatWalletTransactionTitle(
                        tx.narration,
                        tx.type,
                        tx.monnify_transaction_reference,
                      )}
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

      <EsoPayKycModal
        open={kycOpen}
        onOpenChange={setKycOpen}
        loading={kycSaving}
        onSubmit={saveKyc}
        onSaved={() => {
          void retry();
        }}
      />
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: grid.sm,
    paddingTop: grid.sm,
    paddingBottom: grid.xl,
    gap: grid.md,
  },
  lead: {
    fontFamily: ds.font.body,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  meta: {
    fontFamily: ds.font.caption,
    fontSize: ds.type.caption.fontSize,
    color: ds.color.textMuted,
    marginTop: -grid.sm,
  },
  loadingBox: {
    alignItems: 'center',
    gap: grid.sm,
    paddingVertical: grid.lg,
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: HOME_CARD_SURFACE,
    paddingHorizontal: grid.md,
  },
  loadingText: {
    fontFamily: ds.font.body,
    fontSize: 14,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
  },
  loadingHint: {
    fontFamily: ds.font.caption,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.color.textMuted,
    textAlign: 'center',
  },
  errorBox: {
    gap: grid.sm,
    paddingVertical: grid.sm,
  },
  error: {
    fontFamily: ds.font.body,
    fontSize: 14,
    color: ds.color.error,
    lineHeight: 22,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  retryText: {
    fontFamily: ds.font.bodyStrong,
    fontSize: 14,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  historySection: {
    gap: grid.sm,
    paddingTop: grid.xs,
  },
  historyTitle: {
    fontFamily: ds.font.title,
    fontSize: 15,
    letterSpacing: -0.1,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  historyEmpty: {
    fontFamily: ds.font.caption,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.color.textMuted,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: grid.sm,
    paddingVertical: 14,
  },
  historyLabel: {
    flex: 1,
    fontFamily: ds.font.body,
    fontSize: 14,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  historyMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historyAmount: {
    fontFamily: ds.font.amount,
    fontSize: 14,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  historyWhen: {
    fontFamily: ds.font.caption,
    fontSize: 11,
    color: ds.color.textMuted,
  },
});
