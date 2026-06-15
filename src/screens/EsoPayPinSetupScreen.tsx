import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { paramString } from '@/lib/authRouteParams';
import { ESOPAY_HOME_ROUTE, ESOPAY_PIN_GATE_ROUTE } from '@/lib/navigation/productRoutes';
import { EsoPayConfirmPin } from '@/esopay/auth/EsoPayConfirmPin';
import { EsoPayCreatePin } from '@/esopay/auth/EsoPayCreatePin';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';
import { ds } from '@/esopay/theme/designSystem';
type PinPhase = 'create' | 'confirm';

export default function EsoPayPinSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRecovery = paramString(params.recovery) === '1';

  const { configurePin, resetPinForRecovery, pinConfigured, isChecking } = useTransactionPin();

  const [pinPhase, setPinPhase] = useState<PinPhase>('create');
  const [draftPin, setDraftPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isRecovery || isChecking) return;
    if (pinConfigured) {
      router.replace(ESOPAY_PIN_GATE_ROUTE);
    }
  }, [isChecking, isRecovery, pinConfigured, router]);

  const finishSetup = useCallback(() => {
    router.replace(ESOPAY_HOME_ROUTE);
  }, [router]);

  const handleCreateComplete = useCallback((pin: string) => {
    setDraftPin(pin);
    setPinPhase('confirm');
    setPinError(null);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleConfirmComplete = useCallback(
    async (pin: string) => {
      if (busy) return;
      setPinError(null);

      if (pin !== draftPin) {
        setPinError('PINs do not match. Try again.');
        setPinPhase('create');
        setDraftPin('');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setBusy(true);
      try {
        if (isRecovery) {
          await resetPinForRecovery(pin);
        } else {
          await configurePin(pin);
        }
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        finishSetup();
      } catch (error) {
        setPinError(error instanceof Error ? error.message : 'Could not save your PIN');
        setPinPhase('create');
        setDraftPin('');
      } finally {
        setBusy(false);
      }
    },
    [busy, configurePin, draftPin, finishSetup, isRecovery, resetPinForRecovery],
  );

  return (
    <View style={styles.root}>
      {isChecking ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#C9A84C" />
        </View>
      ) : null}

      {!isChecking && pinPhase === 'create' ? (
        <EsoPayCreatePin
          onComplete={handleCreateComplete}
          isRecovery={isRecovery}
        />
      ) : null}

      {!isChecking && pinPhase === 'confirm' ? (
        <EsoPayConfirmPin
          key={draftPin}
          onComplete={(pin) => void handleConfirmComplete(pin)}
          error={pinError}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ds.color.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
