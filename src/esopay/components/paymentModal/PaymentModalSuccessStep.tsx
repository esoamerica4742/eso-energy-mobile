import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { CheckCircle2, Share2, Shield } from 'lucide-react-native';
import type { PaymentModalTarget } from '@/esopay/components/paymentModal/types';
import { paymentModalStyles as styles } from '@/esopay/components/paymentModal/styles';
import { EsoPayPrimaryButton } from '@/esopay/components/EsoPayButtons';
import { PrepaidTokenDeliveryCard } from '@/esopay/components/PrepaidTokenDeliveryCard';
import { PowerShieldFeedbackPrompt } from '@/esopay/components/PowerShieldFeedbackPrompt';
import type { PowerShieldMeter } from '@/esopay/api/types';
import type { PaymentReceiptData } from '@/esopay/utils/receipt';
import { colors } from '@/esopay/theme/colors';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  target: PaymentModalTarget | null;
  amountKobo: number;
  isProcessing: boolean;
  isPendingFulfillment: boolean;
  isTerminalFailure: boolean;
  fulfillmentMessage: string | null;
  paymentRef: string | null;
  resolvedStatus: string;
  receiptToken: string | null;
  tokenFormatted: string | null;
  tokenMeterName: string | null;
  paymentFeedbackDone: boolean;
  feedbackMeterSnapshot: PowerShieldMeter | null;
  receiptData: PaymentReceiptData | null;
  isSharingReceipt: boolean;
  onShareReceipt: () => void;
  onPrintReceipt: () => void;
  onDismiss: () => void;
  onFeedbackSubmitted: () => void;
};

export function PaymentModalSuccessStep({
  target,
  amountKobo,
  isProcessing,
  isPendingFulfillment,
  isTerminalFailure,
  fulfillmentMessage,
  paymentRef,
  resolvedStatus,
  receiptToken,
  tokenFormatted,
  tokenMeterName,
  paymentFeedbackDone,
  feedbackMeterSnapshot,
  receiptData,
  isSharingReceipt,
  onShareReceipt,
  onPrintReceipt,
  onDismiss,
  onFeedbackSubmitted,
}: Props) {
  return (
    <View style={styles.successBlock}>
      {isProcessing ? (
        <ActivityIndicator color={colors.gold} size="large" />
      ) : isPendingFulfillment ? (
        <Shield size={56} color={colors.gold} strokeWidth={1.8} />
      ) : (
        <CheckCircle2
          size={56}
          color={isTerminalFailure ? colors.danger : colors.gold}
          strokeWidth={1.8}
        />
      )}

      <Text style={styles.successTitle}>
        {isPendingFulfillment
          ? 'Payment Received!'
          : isProcessing
            ? 'Confirming payment…'
            : isTerminalFailure
              ? 'Payment failed'
              : 'Payment submitted'}
      </Text>

      {isPendingFulfillment ? (
        <Text style={styles.fulfillmentMessage}>
          {fulfillmentMessage ??
            'The DisCo network is currently undergoing brief maintenance. Your token is safely queued and our system will automatically deliver it via SMS and Push Notification the moment the grid pipes clear.'}
        </Text>
      ) : null}

      <Text style={styles.successAmount}>{formatCurrency(amountKobo)}</Text>
      {paymentRef ? <Text style={styles.refText}>Ref: {paymentRef}</Text> : null}

      {!isProcessing && !isPendingFulfillment ? (
        <Text style={styles.statusPill}>Status: {resolvedStatus.replace(/_/g, ' ')}</Text>
      ) : null}

      {isPendingFulfillment ? (
        <Text style={styles.statusPill}>Status: Queued for delivery</Text>
      ) : null}

      {receiptToken &&
      target?.provider.category === 'electricity' &&
      resolvedStatus === 'success' ? (
        <PrepaidTokenDeliveryCard
          token={receiptToken}
          tokenFormatted={tokenFormatted}
          meterName={tokenMeterName ?? target.label}
          amountKobo={amountKobo}
        />
      ) : receiptToken ? (
        <View style={styles.tokenBox}>
          <Text style={styles.tokenLabel}>Token / receipt</Text>
          <Text style={styles.tokenValue} selectable>
            {receiptToken}
          </Text>
        </View>
      ) : null}

      {target?.provider.category === 'electricity' &&
      !isProcessing &&
      !isTerminalFailure &&
      resolvedStatus === 'success' &&
      !paymentFeedbackDone ? (
        <PowerShieldFeedbackPrompt
          context="post_payment"
          meter={feedbackMeterSnapshot}
          onSubmitted={onFeedbackSubmitted}
        />
      ) : null}

      <View style={styles.receiptActions}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={onShareReceipt}
          disabled={!receiptData || isSharingReceipt}
        >
          {isSharingReceipt ? (
            <ActivityIndicator color={colors.gold} size="small" />
          ) : (
            <>
              <Share2 size={16} color={colors.gold} />
              <Text style={styles.secondaryBtnText}>Share PDF</Text>
            </>
          )}
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={onPrintReceipt}
          disabled={!receiptData}
        >
          <Text style={styles.secondaryBtnText}>Print</Text>
        </Pressable>
      </View>

      <EsoPayPrimaryButton label="Done" onPress={onDismiss} />
    </View>
  );
}
