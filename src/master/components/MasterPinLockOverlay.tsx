import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PinKeypad } from '@/esopay/components/pin/PinKeypad';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { MASTER_PIN_LENGTH } from '@/master/constants';
import { clearMasterPin, verifyMasterPin } from '@/master/masterPin';
import { useMasterSessionStore } from '@/master/masterSessionStore';
import { useMasterBiometricUnlock } from '@/master/hooks/useMasterBiometricUnlock';
import { MasterOtpOverlay } from '@/master/components/MasterOtpOverlay';
import { MasterPinShell } from '@/master/components/MasterPinShell';
import { beginEsoPayPinRecovery } from '@/esopay/lib/pinRecovery';
import { MASTER_PIN_SETUP_ROUTE } from '@/lib/navigation/productRoutes';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';

type Props = {
  visible: boolean;
  userId: string;
  userEmail?: string | null;
  onUnlocked: () => void;
};

export function MasterPinLockOverlay({ visible, userId, userEmail, onUnlocked }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const { verifyPin } = useTransactionPin();
  const biometrics = useMasterBiometricUnlock(userId);

  const unlock = useCallback(() => {
    useMasterSessionStore.getState().setPinUnlocked(true);
    useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPin('');
    setError(null);
    onUnlocked();
  }, [onUnlocked]);

  const tryUnlock = useCallback(
    async (value: string) => {
      if (busy || value.length !== MASTER_PIN_LENGTH) return;
      setBusy(true);
      setError(null);

      let ok = await verifyMasterPin(userId, value);
      if (!ok) {
        try {
          const server = await verifyPin(value);
          ok = server.ok;
        } catch {
          ok = false;
        }
      }

      if (!ok) {
        setError('Incorrect PIN. Try again.');
        setPin('');
        setBusy(false);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setBusy(false);
      unlock();
    },
    [busy, unlock, userId, verifyPin],
  );

  const tryBiometric = useCallback(async () => {
    if (busy) return;
    const ok = await biometrics.authenticate();
    if (ok) unlock();
  }, [biometrics, busy, unlock]);

  useEffect(() => {
    if (!visible || !biometrics.enabled || busy) return;
    void tryBiometric();
  }, [biometrics.enabled, busy, tryBiometric, visible]);

  const onDigit = useCallback(
    (digit: string) => {
      if (busy || pin.length >= MASTER_PIN_LENGTH) return;
      const next = `${pin}${digit}`;
      setPin(next);
      setError(null);
      if (next.length === MASTER_PIN_LENGTH) void tryUnlock(next);
    },
    [busy, pin, tryUnlock],
  );

  const onBackspace = useCallback(() => {
    if (busy) return;
    setPin((p) => p.slice(0, -1));
    setError(null);
  }, [busy]);

  const onForgotPin = useCallback(() => {
    if (!userEmail) {
      setError('Add an email to your account to reset your PIN.');
      return;
    }
    setOtpOpen(true);
  }, [userEmail]);

  const onRecoveryVerified = useCallback(async () => {
    setOtpOpen(false);
    setBusy(true);
    try {
      await beginEsoPayPinRecovery();
      await clearMasterPin(userId);
      useMasterSessionStore.getState().setPinUnlocked(false);
      router.replace(MASTER_PIN_SETUP_ROUTE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start PIN recovery.');
    } finally {
      setBusy(false);
    }
  }, [router, userId]);

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent={false}>
        <StatusBar barStyle="light-content" />
        <MasterPinShell
          mode="unlock"
          step="unlock"
          title="Welcome back"
          subtitle="Enter your PIN to unlock Eso Energy."
          filledCount={pin.length}
          error={error}
          paddingTop={insets.top + 8}
          paddingBottom={insets.bottom}
          footer={
            <Pressable
              onPress={onForgotPin}
              style={({ pressed }) => [styles.forgotPinBtn, pressed && styles.forgotPinBtnPressed]}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Forgot PIN"
            >
              <Text style={styles.forgotPinText}>Forgot PIN?</Text>
            </Pressable>
          }
          keypad={
            <PinKeypad
              onDigit={onDigit}
              onBackspace={onBackspace}
              disabled={busy}
              backspaceDisabled={!pin.length || busy}
              variant="quiet"
              horizontalPadding={24}
              showBiometric={biometrics.available && biometrics.enabled}
              onBiometricPress={() => void tryBiometric()}
            />
          }
        />
      </Modal>

      {userEmail ? (
        <MasterOtpOverlay
          visible={otpOpen}
          email={userEmail}
          onClose={() => setOtpOpen(false)}
          onVerified={() => void onRecoveryVerified()}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  forgotPinBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotPinBtnPressed: {
    opacity: 0.7,
  },
  forgotPinText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
});
