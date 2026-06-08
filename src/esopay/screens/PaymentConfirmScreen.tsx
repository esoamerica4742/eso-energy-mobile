import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  getPaymentErrorMessage,
  isInsufficientWalletError,
  useBillDetail,
  usePayBillFromWallet,
  useWallet,
} from '@/esopay/api/hooks/useBilling';
import { BalanceDisplay } from '@/esopay/components/BalanceDisplay';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';
import { NumberTicker } from '@/esopay/components/NumberTicker';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { formatBillPeriod } from '@/esopay/utils/billUi';
import { formatCurrency } from '@/esopay/utils/currency';
import {
  esopayBillDetailHref,
} from '@/esopay/navigation/routes';
import { useEnodeToast } from '@/providers/EnodeToastProvider';

type Props = {
  billId: string;
};

async function playSuccessHaptics() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await new Promise((resolve) => setTimeout(resolve, T.animation.haptic.paymentSuccessDelayMs));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

async function playErrorHaptics() {
  for (let i = 0; i < T.animation.haptic.errorPulseCount; i += 1) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (i < T.animation.haptic.errorPulseCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, T.animation.haptic.errorIntervalMs));
    }
  }
}

export function PaymentConfirmScreen({ billId }: Props) {
  const router = useRouter();
  const toast = useEnodeToast();
  const billQuery = useBillDetail(billId);
  const walletQuery = useWallet();
  const payMutation = usePayBillFromWallet();
  const submittingRef = useRef(false);

  const [showSavingsTicker, setShowSavingsTicker] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [lastError, setLastError] = useState<unknown>(null);

  const bill = billQuery.data;
  const walletBalance = walletQuery.data?.balance_kobo ?? 0;

  const balanceAfterKobo = useMemo(() => {
    if (!bill) return walletBalance;
    return Math.max(0, walletBalance - bill.net_amount_kobo);
  }, [bill, walletBalance]);

  const goBack = useCallback(() => router.back(), [router]);

  const handleConfirm = useCallback(() => {
    if (payMutation.isPending || submittingRef.current || !bill) return;

    submittingRef.current = true;
    setFailureMessage(null);
    setLastError(null);

    payMutation.mutate(
      { billId },
      {
        onSuccess: async (response) => {
          if (response.bill_payment.status === 'success') {
            await playSuccessHaptics();
            setShowSavingsTicker(true);
            toast.show('Bill paid ✓', 'success');
            setTimeout(() => {
              router.replace(esopayBillDetailHref(billId));
            }, 900);
          } else {
            setFailureMessage('Payment is processing. Check back shortly.');
          }
        },
        onError: async (error) => {
          await playErrorHaptics();
          setLastError(error);
          setFailureMessage(getPaymentErrorMessage(error));
          if (isInsufficientWalletError(error)) {
            toast.show('Insufficient wallet balance', 'warning');
          }
        },
        onSettled: () => {
          submittingRef.current = false;
        },
      },
    );
  }, [bill, billId, payMutation, router, toast]);

  if (!bill && billQuery.isLoading) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader title="Confirm Payment" canGoBack onBack={goBack} />
        <View style={styles.center}>
          <Text style={styles.muted}>Loading bill…</Text>
        </View>
      </EsoPayScreenShell>
    );
  }

  if (!bill) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader title="Confirm Payment" canGoBack onBack={goBack} />
        <View style={styles.center}>
          <Text style={styles.error}>Bill not found.</Text>
          <GoldCTAButton label="Go back" onPress={goBack} />
        </View>
      </EsoPayScreenShell>
    );
  }

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title="Confirm Payment" canGoBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.period}>
          {formatBillPeriod(bill.billing_period_start, bill.billing_period_end)}
        </Text>
        <Text style={styles.utility}>{bill.utility_provider}</Text>

        <Text style={styles.heroAmount}>{formatCurrency(bill.net_amount_kobo, bill.currency)}</Text>
        <Text style={styles.heroCaption}>Net amount due</Text>

        <View style={styles.balanceGrid}>
          <BalanceDisplay
            label="Current wallet"
            amountKobo={walletBalance}
            currency={bill.currency}
            loading={walletQuery.isLoading}
          />
          <BalanceDisplay
            label="After payment"
            amountKobo={balanceAfterKobo}
            currency={bill.currency}
            variant="emphasis"
            loading={walletQuery.isLoading}
          />
        </View>

        <View style={styles.savingsCard}>
          <Text style={styles.savingsLabel}>Inverter savings this cycle</Text>
          {showSavingsTicker ? (
            <NumberTicker valueKobo={bill.offset_amount_kobo} currency={bill.currency} />
          ) : (
            <Text style={styles.savingsValue}>
              {formatCurrency(bill.offset_amount_kobo, bill.currency)}
            </Text>
          )}
        </View>

        {failureMessage ? (
          <View style={styles.failureBox}>
            <Text style={styles.failureTitle}>Payment failed</Text>
            <Text style={styles.failureText}>{failureMessage}</Text>
            <GoldCTAButton
              label="Retry payment"
              onPress={handleConfirm}
              isLoading={payMutation.isPending}
              isDisabled={isInsufficientWalletError(lastError)}
            />
          </View>
        ) : (
          <GoldCTAButton
            label={`Confirm · Pay ${formatCurrency(bill.net_amount_kobo, bill.currency)}`}
            onPress={handleConfirm}
            isLoading={payMutation.isPending}
          />
        )}

        <Text style={styles.disclaimer}>
          Your Monnify wallet will be debited and the utility bill settled via Monnify Bill
          Payment. This action cannot be undone.
        </Text>
      </ScrollView>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: T.layout.screenMargin,
    paddingBottom: T.spacing['6xl'],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: T.layout.screenMargin,
    gap: T.spacing.lg,
  },
  period: {
    marginTop: T.spacing.lg,
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.text.secondary,
  },
  utility: {
    fontFamily: esopayFonts.heading,
    fontSize: T.type.h2.size,
    color: T.color.text.primary,
    marginBottom: T.spacing.xl,
  },
  heroAmount: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.hero.size,
    lineHeight: T.type.hero.lineHeight,
    letterSpacing: T.type.hero.letterSpacing,
    color: T.color.gold.shimmer,
  },
  heroCaption: {
    marginTop: T.spacing.xs,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
    marginBottom: T.spacing.xxl,
  },
  balanceGrid: {
    gap: T.spacing.sm,
    marginBottom: T.spacing.xxl,
  },
  savingsCard: {
    backgroundColor: T.color.bg.surface,
    borderRadius: T.radius.sm,
    borderWidth: 1,
    borderColor: `${T.color.gold.primary}33`,
    padding: T.spacing.xl,
    marginBottom: T.spacing.xxl,
  },
  savingsLabel: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.label.size,
    color: T.color.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: T.type.label.letterSpacing,
    marginBottom: T.spacing.sm,
  },
  savingsValue: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.display.size,
    color: T.color.gold.shimmer,
  },
  failureBox: {
    gap: T.spacing.md,
    marginBottom: T.spacing.lg,
    padding: T.spacing.lg,
    borderRadius: T.radius.sm,
    backgroundColor: `${T.color.red.alert}10`,
    borderWidth: 1,
    borderColor: `${T.color.red.alert}33`,
  },
  failureTitle: {
    fontFamily: esopayFonts.heading,
    fontSize: T.type.h3.size,
    color: T.color.red.alert,
  },
  failureText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.body.size,
    color: T.color.text.primary,
  },
  disclaimer: {
    marginTop: T.spacing.lg,
    fontFamily: esopayFonts.bodyLight,
    fontSize: T.type.caption.size,
    lineHeight: T.type.caption.lineHeight,
    color: T.color.text.disabled,
    textAlign: 'center',
  },
  muted: {
    fontFamily: esopayFonts.body,
    color: T.color.text.secondary,
  },
  error: {
    fontFamily: esopayFonts.body,
    color: T.color.red.alert,
    textAlign: 'center',
  },
});
