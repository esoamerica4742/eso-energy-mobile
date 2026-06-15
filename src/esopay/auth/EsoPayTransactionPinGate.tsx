import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { EsoPayPinLoginScreen } from '@/esopay/auth/EsoPayPinLoginScreen';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { sendEsoPayEmailOtp } from '@/lib/authOtp';
import { ESOPAY_PIN_SETUP_ROUTE } from '@/lib/navigation/productRoutes';
/** Vault PIN gate canvas. */
export const TRANSACTION_PIN_SCREEN_BG = '#080A0F';

type Props = {
  onUnlockSuccess?: () => void;
};

/** Full-screen transaction PIN gate — returning users unlock Eso Pay here. */
export function EsoPayTransactionPinGate({ onUnlockSuccess }: Props) {
  const router = useRouter();
  const user = useEsoPayAuthStore((s) => s.user);
  const lockSession = useEsoPayAuthStore((s) => s.setPinSessionUnlocked);

  const { pinConfigured, isChecking, userIdReady } = useTransactionPin();
  const [recoverySending, setRecoverySending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userIdReady || isChecking) return;
    if (!pinConfigured) {
      router.replace(ESOPAY_PIN_SETUP_ROUTE);
    }
  }, [isChecking, pinConfigured, router, userIdReady]);

  const handleForgotPin = useCallback(async () => {
    const email = user?.email?.trim();
    if (!email) {
      setError('Sign in again with your email to reset your PIN.');
      return;
    }
    setRecoverySending(true);
    setError(null);
    const result = await sendEsoPayEmailOtp(email);
    setRecoverySending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    lockSession(false);
    router.push({
      pathname: '/auth/verify',
      params: { email, module: 'esopay', recovery: 'pin' },
    });
  }, [lockSession, router, user?.email]);

  if (!userIdReady || isChecking || !pinConfigured) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  return (
    <EsoPayPinLoginScreen
      onUnlockSuccess={() => onUnlockSuccess?.()}
      onForgotPin={() => void handleForgotPin()}
      recoverySending={recoverySending}
      bannerError={error}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#080A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
