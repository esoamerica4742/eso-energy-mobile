import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinEntry } from '@/esopay/components/PinEntry';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { sendEsoPayEmailOtp } from '@/lib/authOtp';
import { ESOPAY_SETTINGS_HREF } from '@/esopay/navigation/routes';

/** Design-system canvas — never pure black on the PIN gate screen. */
export const LOGIN_PIN_SCREEN_BG = '#080A0F';
const GOLD = '#C9A84C';

/** Single transaction PIN gate — unlocks Eso Pay and matches payment PIN. */
export function EsoPayLoginPinGate() {
  const router = useRouter();
  const user = useEsoPayAuthStore((s) => s.user);
  const setUnlocked = useEsoPayAuthStore((s) => s.setLoginPinUnlocked);
  const {
    pinConfigured,
    isChecking,
    locked,
    attemptsRemaining,
    verifyPin,
    refresh,
    userIdReady,
  } = useTransactionPin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recoverySending, setRecoverySending] = useState(false);

  const subtitle = useMemo(() => {
    if (!userIdReady) return 'Loading your account…';
    if (isChecking) return 'Checking your PIN…';
    if (locked) return 'Too many attempts. Reset your PIN with your email or try again later.';
    if (!pinConfigured) return 'Set a transaction PIN in Settings to secure Eso Pay.';
    if (attemptsRemaining != null && attemptsRemaining <= 2) {
      return `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before lockout.`;
    }
    return 'Enter your 4-digit transaction PIN to open Eso Pay.';
  }, [attemptsRemaining, isChecking, locked, pinConfigured, userIdReady]);

  const handleComplete = useCallback(
    async (value: string) => {
      if (locked) return;
      setError(null);
      const ok = await verifyPin(value);
      if (!ok) {
        setError(locked ? 'PIN locked. Use Forgot PIN to reset.' : 'Incorrect PIN');
        setPin('');
        return;
      }
      setUnlocked(true);
    },
    [locked, setUnlocked, verifyPin],
  );

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
    setUnlocked(false);
    router.push({
      pathname: '/auth/verify',
      params: { email, module: 'esopay', recovery: 'pin' },
    });
  }, [router, setUnlocked, user?.email]);

  const handleManagePin = useCallback(() => {
    void refresh();
    router.push(ESOPAY_SETTINGS_HREF);
  }, [refresh, router]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.wrap}>
        <Text style={styles.brand}>Eso Pay</Text>
        <PinEntry
          variant="login"
          title="Transaction PIN"
          subtitle={subtitle}
          value={pin}
          onChange={setPin}
          onComplete={(value) => void handleComplete(value)}
          error={error}
          showBackspace
        />

        <View style={styles.actions}>
          <Pressable
            onPress={() => void handleForgotPin()}
            disabled={recoverySending}
            style={styles.forgotRow}
            accessibilityRole="button"
            accessibilityLabel="Forgot PIN"
          >
            {recoverySending ? (
              <ActivityIndicator size="small" color={GOLD} />
            ) : (
              <Text style={styles.forgotText}>Forgot PIN? Verify email to reset</Text>
            )}
          </Pressable>
          <Pressable
            onPress={handleManagePin}
            style={styles.managePinRow}
            accessibilityRole="button"
            accessibilityLabel="Manage PIN in Settings"
          >
            <Text style={styles.managePinText}>Manage PIN in Settings</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LOGIN_PIN_SCREEN_BG,
  },
  wrap: {
    flex: 1,
    backgroundColor: LOGIN_PIN_SCREEN_BG,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xxxl,
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: GOLD,
    textAlign: 'center',
    letterSpacing: 18 * 0.06,
    marginBottom: spacing.xl,
  },
  actions: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 36,
    paddingBottom: spacing.xxl,
  },
  forgotRow: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  forgotText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: GOLD,
    textAlign: 'center',
  },
  managePinRow: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  managePinText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
});

