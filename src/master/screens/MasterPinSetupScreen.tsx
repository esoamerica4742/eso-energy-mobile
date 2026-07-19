import { useCallback, useEffect, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fingerprint, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { PinKeypad } from '@/esopay/components/pin/PinKeypad';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { MASTER_PIN_LENGTH } from '@/master/constants';
import { hasMasterPin, setMasterPin } from '@/master/masterPin';
import { useMasterSessionStore } from '@/master/masterSessionStore';
import { useMasterBiometricUnlock } from '@/master/hooks/useMasterBiometricUnlock';
import { MasterPinShell } from '@/master/components/MasterPinShell';
import { ACCESS_ROUTE } from '@/lib/navigation/productRoutes';
import { inter } from '@/theme/fonts';

const BG = '#000000';
const TEXT = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.55)';
const PRESS_SPRING = { stiffness: 320, damping: 22 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Step = 'create' | 'confirm' | 'biometric';

export default function MasterPinSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const api = useEsoPayApiClient();
  const apiEnabled = useEsoPayEnabled();
  const userId = useEsoPayAuthStore((s) => s.user?.id);
  const biometrics = useMasterBiometricUnlock(userId);

  const [step, setStep] = useState<Step>('create');
  const [draft, setDraft] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const scale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const goToHub = useCallback(() => {
    router.replace(ACCESS_ROUTE);
  }, [router]);

  // If PIN already exists (e.g. remount after success), never ask again.
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    void hasMasterPin(userId).then((configured) => {
      if (!alive || !configured) return;
      useMasterSessionStore.getState().setPinUnlocked(true);
      useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
      goToHub();
    });
    return () => {
      alive = false;
    };
  }, [goToHub, userId]);

  const resetEntry = useCallback(() => {
    setDraft('');
    setError(null);
  }, []);

  const finish = useCallback(
    async (confirmed: string) => {
      if (!userId) {
        setError('Session expired. Sign in again.');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        // Local master PIN is source of truth for unlock — never block on server sync.
        await setMasterPin(userId, confirmed);
        useMasterSessionStore.getState().setPinUnlocked(true);
        useEsoPayAuthStore.getState().setPinSessionUnlocked(true);

        if (apiEnabled) {
          try {
            await api.security.setTransactionPin({ pin: confirmed });
          } catch {
            // Soft-fail: payments can prompt for PIN sync later. Unlock must continue.
          }
        }

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (biometrics.available) {
          setStep('biometric');
          setDraft('');
        } else {
          goToHub();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save PIN.');
        resetEntry();
        setStep('create');
        setPin('');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setBusy(false);
      }
    },
    [api, apiEnabled, biometrics.available, goToHub, resetEntry, userId],
  );

  const onDigit = useCallback(
    (digit: string) => {
      if (busy || draft.length >= MASTER_PIN_LENGTH) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = `${draft}${digit}`;
      setDraft(next);
      setError(null);
      if (next.length < MASTER_PIN_LENGTH) return;

      if (step === 'create') {
        setPin(next);
        setDraft('');
        setStep('confirm');
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      }

      if (next !== pin) {
        setError('PINs don’t match. Try again.');
        setDraft('');
        // Stay on confirm — don’t bounce back to create (Revolut-style).
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      void finish(next);
    },
    [busy, draft, finish, pin, step],
  );

  const onBackspace = useCallback(() => {
    if (busy) return;
    setDraft((p) => p.slice(0, -1));
    setError(null);
  }, [busy]);

  const enableBiometric = useCallback(async () => {
    setBusy(true);
    try {
      await biometrics.setPreference(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goToHub();
    } catch {
      setError('Could not enable biometrics. You can turn this on later in Settings.');
    } finally {
      setBusy(false);
    }
  }, [biometrics, goToHub]);

  if (step === 'biometric') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <LinearGradient
          pointerEvents="none"
          colors={['#0B152B', '#050A14', BG]}
          locations={[0, 0.42, 1]}
          style={styles.wash}
        />

        <View
          style={[
            styles.biometricInner,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <Animated.View entering={FadeIn.duration(280)} style={styles.biometricBody}>
            <View style={styles.biometricIcon}>
              <Fingerprint size={34} color={TEXT} strokeWidth={1.7} />
            </View>

            <Text style={styles.biometricTitle}>Enable {biometrics.label}?</Text>
            <Text style={styles.biometricSubtitle}>
              Unlock Eso Energy in a glance. Your biometric data never leaves this device.
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Animated.View>

          <AnimatedPressable
            onPress={() => void enableBiometric()}
            disabled={busy}
            onPressIn={() => {
              if (!busy) scale.value = withSpring(0.97, PRESS_SPRING);
            }}
            onPressOut={() => {
              scale.value = withSpring(1, PRESS_SPRING);
            }}
            style={[styles.primaryBtn, busy && styles.primaryBtnDisabled, btnStyle]}
            accessibilityRole="button"
            accessibilityLabel={`Enable ${biometrics.label}`}
          >
            <Text style={styles.primaryBtnText}>Enable {biometrics.label}</Text>
          </AnimatedPressable>

          <Pressable
            onPress={goToHub}
            disabled={busy}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Not now"
          >
            <Text style={styles.secondaryBtnText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isCreate = step === 'create';
  const title = isCreate ? 'Create your PIN' : 'Confirm your PIN';
  const subtitle = isCreate
    ? 'A 4-digit code to unlock Eso Energy and confirm payments.'
    : 'Re-enter the same PIN to finish setup.';

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <MasterPinShell
        mode="setup"
        step={step}
        progressStep={isCreate ? 1 : 2}
        title={title}
        subtitle={subtitle}
        filledCount={draft.length}
        error={error}
        paddingTop={insets.top + 12}
        paddingBottom={insets.bottom}
        footer={
          <View style={styles.trustRow}>
            <ShieldCheck size={14} color={MUTED} strokeWidth={2.2} />
            <Text style={styles.trustText}>Encrypted on this device</Text>
          </View>
        }
        keypad={
          <PinKeypad
            onDigit={onDigit}
            onBackspace={onBackspace}
            disabled={busy}
            backspaceDisabled={!draft.length || busy}
            variant="quiet"
            horizontalPadding={28}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
  },
  biometricInner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  biometricBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  biometricTitle: {
    fontFamily: inter.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.7,
    color: TEXT,
    textAlign: 'center',
    marginBottom: 10,
  },
  biometricSubtitle: {
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    textAlign: 'center',
    maxWidth: 300,
  },
  errorText: {
    marginTop: 16,
    fontFamily: inter.regular,
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontFamily: inter.bold,
    fontSize: 16,
    color: '#000000',
  },
  secondaryBtn: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: inter.semibold,
    fontSize: 15,
    color: MUTED,
  },
  pressed: {
    opacity: 0.7,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 4,
  },
  trustText: {
    fontFamily: inter.medium,
    fontSize: 12,
    color: MUTED,
    letterSpacing: 0.2,
  },
});
