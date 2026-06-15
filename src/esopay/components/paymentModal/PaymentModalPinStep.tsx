import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { paymentModalStyles as styles } from '@/esopay/components/paymentModal/styles';
import { PinEntry } from '@/esopay/components/PinEntry';
import { colors } from '@/esopay/theme/colors';

type Props = {
  pinTitle: string;
  pinSubtitle: string;
  pinValue: string;
  onPinChange: (value: string) => void;
  onPinComplete: (pin: string) => void;
  pinError: string | null;
  isPurchasePending: boolean;
  onBackToForm: () => void;
};

export function PaymentModalPinStep({
  pinTitle,
  pinSubtitle,
  pinValue,
  onPinChange,
  onPinComplete,
  pinError,
  isPurchasePending,
  onBackToForm,
}: Props) {
  return (
    <View>
      <PinEntry
        title={pinTitle}
        subtitle={pinSubtitle}
        value={pinValue}
        onChange={onPinChange}
        onComplete={onPinComplete}
        error={pinError}
      />

      {isPurchasePending ? (
        <View style={styles.processingRow}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.processingText}>Processing payment…</Text>
        </View>
      ) : (
        <Pressable onPress={onBackToForm} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to payment details</Text>
        </Pressable>
      )}
    </View>
  );
}
