import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { PinEntry } from '@/esopay/components/PinEntry';
import { useLoginPin } from '@/esopay/hooks/useLoginPin';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { signOutEsoPay } from '@/esopay/auth/signOutEsoPay';

const SCREEN_BG = '#080A0F';
const LOGIN_GOLD = '#C9A84C';

export function EsoPayLoginPinGate() {
  const router = useRouter();
  const setUnlocked = useEsoPayAuthStore((s) => s.setLoginPinUnlocked);
  const { pinConfigured, isChecking, verifyPin, userIdReady } = useLoginPin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    if (!userIdReady) return 'Loading your account…';
    if (isChecking) return 'Checking login PIN…';
    if (!pinConfigured) return 'No login PIN configured for this device.';
    return 'Enter your 4-digit login PIN to continue.';
  }, [isChecking, pinConfigured, userIdReady]);

  const handleComplete = useCallback(
    async (value: string) => {
      setError(null);
      const ok = await verifyPin(value);
      if (!ok) {
        setError('Incorrect PIN');
        setPin('');
        return;
      }
      setUnlocked(true);
    },
    [setUnlocked, verifyPin],
  );

  const handleSignOut = useCallback(async () => {
    await signOutEsoPay();
    router.replace('/');
  }, [router]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>Eso Pay</Text>
      <PinEntry
        variant="login"
        title="Login PIN"
        subtitle={subtitle}
        value={pin}
        onChange={setPin}
        onComplete={(value) => void handleComplete(value)}
        error={error}
        showBackspace
      />

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/esopay/settings')}
          style={styles.managePinRow}
          accessibilityRole="button"
          accessibilityLabel="Manage PIN in Settings"
        >
          <Text style={styles.managePinText}>Manage PIN in Settings</Text>
          <CaretRight size={16} color="rgba(255,255,255,0.4)" weight="regular" />
        </Pressable>
        <Pressable
          onPress={() => void handleSignOut()}
          style={styles.signOutRow}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          {({ pressed }) => (
            <Text style={[styles.signOutText, pressed && styles.signOutTextPressed]}>Sign out</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: SCREEN_BG,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xxxl,
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: LOGIN_GOLD,
    textAlign: 'center',
    letterSpacing: 18 * 0.04,
    marginBottom: spacing.xl,
  },
  actions: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 36,
    paddingBottom: spacing.xxl,
  },
  managePinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  managePinText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  signOutRow: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  signOutText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },
  signOutTextPressed: {
    color: 'rgba(255,255,255,0.6)',
  },
});
