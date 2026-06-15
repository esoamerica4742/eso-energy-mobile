import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { paramString } from '@/lib/authRouteParams';
import { ESOPAY_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import { EsoPayConfirmPin } from '@/esopay/auth/EsoPayConfirmPin';
import { EsoPayCreatePin } from '@/esopay/auth/EsoPayCreatePin';
import { EsoPayFinishSetup } from '@/esopay/auth/EsoPayFinishSetup';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { esopayFundWalletHref } from '@/esopay/navigation/routes';

type ActivateStep = 'pin' | 'wallet';
type PinPhase = 'create' | 'confirm';

export default function EsoPayActivateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRecovery = paramString(params.recovery) === '1';

  const setPinUnlocked = useEsoPayAuthStore((s) => s.setLoginPinUnlocked);
  const { pinConfigured, isChecking, configurePin, resetPinForRecovery } = useTransactionPin();

  const [step, setStep] = useState<ActivateStep>('pin');
  const [pinPhase, setPinPhase] = useState<PinPhase>('create');
  const [draftPin, setDraftPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isChecking || isRecovery) return;
    if (pinConfigured) {
      setStep('wallet');
    }
  }, [isChecking, isRecovery, pinConfigured]);

  const finishActivation = useCallback(() => {
    setPinUnlocked(true);
    router.replace(ESOPAY_HOME_ROUTE);
  }, [router, setPinUnlocked]);

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
        setPinUnlocked(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (isRecovery) {
          finishActivation();
          return;
        }
        if (isRecovery) {
          finishActivation();
          return;
        }
        setStep('wallet');
      } catch (error) {
        setPinError(error instanceof Error ? error.message : 'Could not save your PIN');
        setPinPhase('create');
        setDraftPin('');
      } finally {
        setBusy(false);
      }
    },
    [busy, configurePin, draftPin, finishActivation, isRecovery, resetPinForRecovery, setPinUnlocked],
  );

  return (
    <View style={styles.root}>
      {step === 'pin' && pinPhase === 'create' ? (
        <EsoPayCreatePin onComplete={handleCreateComplete} isRecovery={isRecovery} />
      ) : null}

      {step === 'pin' && pinPhase === 'confirm' ? (
        <EsoPayConfirmPin
          key={draftPin}
          onComplete={(pin) => void handleConfirmComplete(pin)}
          error={pinError}
        />
      ) : null}

      {step === 'wallet' ? (
        <EsoPayFinishSetup
          onFundWallet={() => {
            setPinUnlocked(true);
            router.replace(esopayFundWalletHref());
          }}
          onSkip={finishActivation}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
});
