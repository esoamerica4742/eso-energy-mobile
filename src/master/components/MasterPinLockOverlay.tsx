import { useCallback, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PinKeypad } from '@/esopay/components/pin/PinKeypad';
import { PinVaultDots } from '@/esopay/components/pin/PinVaultDots';
import { MASTER_PIN_LENGTH } from '@/master/constants';
import { verifyMasterPin } from '@/master/masterPin';
import { useMasterSessionStore } from '@/master/masterSessionStore';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';

type Props = {
  visible: boolean;
  userId: string;
  onUnlocked: () => void;
};

export function MasterPinLockOverlay({ visible, userId, onUnlocked }: Props) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { verifyPin } = useTransactionPin();

  const reset = useCallback(() => {
    setPin('');
    setError(null);
    setBusy(false);
  }, []);

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

      useMasterSessionStore.getState().setPinUnlocked(true);
      useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      reset();
      onUnlocked();
    },
    [busy, onUnlocked, reset, userId, verifyPin],
  );

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

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View
        className="flex-1 bg-[#080A0F]"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-2 text-center text-2xl font-bold text-white">
            Welcome back
          </Text>
          <Text className="mb-10 text-center text-sm text-[#8A94A6]">
            Please enter your 4-digit PIN to continue
          </Text>

          <PinVaultDots filledCount={pin.length} errorFlash={Boolean(error)} />

          {error ? (
            <Text className="mt-4 text-center text-sm text-red-400">{error}</Text>
          ) : (
            <Text className="mt-4 text-center text-xs text-[#4A5568]">
              Secure Access · PIN-protected
            </Text>
          )}
        </View>

        <PinKeypad
          onDigit={onDigit}
          onBackspace={onBackspace}
          disabled={busy}
          backspaceDisabled={!pin.length || busy}
          variant="welcomeBack"
          horizontalPadding={24}
        />
      </View>
    </Modal>
  );
}
