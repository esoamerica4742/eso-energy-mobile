import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getCurrentUser, getDisplayName } from '@/lib/authProfile';
import {
  clearOperatorPin,
  hasOperatorPin,
  OPERATOR_PIN_LENGTH,
  verifyOperatorPin,
} from '@/lib/monitoring/operatorPin';
import { MONITORING_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import { inter } from '@/theme/fonts';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import { TealPulseIcon } from '@/monitoring/auth/inverter/MonitoringAuthChrome';
import { resolveMonitoringAuthRoute } from '@/monitoring/auth/inverter/monitoringAuthRoute';
import { clearMonitoringPinSession, setMonitoringPinUnlocked } from '@/monitoring/auth/monitoringPinSession';
import { clearMonitoringHasPin } from '@/monitoring/auth/inverter/monitoringUserPin';
import { PinBoxes } from '@/monitoring/auth/inverter/PinBoxes';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';
import { useAuthStore } from '@/stores/authStore';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

type PinVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'missing_pin' | 'wrong_pin' | 'no_user' };

export default function InverterUnlockScreen() {
  const user = useAuthStore((s) => s.user);
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [pinReady, setPinReady] = useState<boolean | null>(null);
  const autoSubmitRef = useRef(false);
  const shake = useSharedValue(0);
  const hintOpacity = useSharedValue(1);

  const displayName = user
    ? getDisplayName(user, user.email?.split('@')[0] ?? 'there')
    : 'there';

  useEffect(() => {
    hintOpacity.value = withTiming(pin.length === 0 ? 1 : 0, { duration: 150 });
  }, [hintOpacity, pin.length]);

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const activeUser = user ?? (await getCurrentUser());
      if (cancelled || !activeUser) return;
      const route = await resolveMonitoringAuthRoute(activeUser);
      if (cancelled) return;
      if (route !== '/inverter/unlock') {
        router.replace(route);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setPinReady(null);
      return;
    }

    let cancelled = false;
    void hasOperatorPin(user.id).then((exists) => {
      if (cancelled) return;
      if (!exists) {
        router.replace('/inverter/create-pin');
        return;
      }
      setPinReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!locked || lockoutSeconds <= 0) return;
    const timer = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockoutSeconds, locked]);

  useEffect(() => {
    if (locked && lockoutSeconds <= 0) {
      setLocked(false);
      setAttempts(0);
      setError(false);
      setErrorMessage('');
      setPin('');
      autoSubmitRef.current = false;
    }
  }, [lockoutSeconds, locked]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerShake = useCallback(() => {
    shake.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [shake]);

  const verifyUnlockPin = useCallback(
    async (value: string): Promise<PinVerifyResult> => {
      const userId = user?.id;
      if (!userId) return { ok: false, reason: 'no_user' };

      const exists = await hasOperatorPin(userId);
      if (!exists) return { ok: false, reason: 'missing_pin' };

      const ok = await verifyOperatorPin(userId, value);
      return ok ? { ok: true } : { ok: false, reason: 'wrong_pin' };
    },
    [user?.id],
  );

  const handleWrongPin = useCallback(
    (nextAttempts: number) => {
      autoSubmitRef.current = false;
      setPin('');
      setError(true);
      triggerShake();

      if (nextAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setLockoutSeconds(LOCKOUT_SECONDS);
        setErrorMessage('');
        return;
      }

      const remaining = MAX_ATTEMPTS - nextAttempts;
      setErrorMessage(
        `Incorrect PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      );
    },
    [triggerShake],
  );

  const submitPin = useCallback(
    async (value: string) => {
      if (locked || verifying || pinReady === false || value.length < OPERATOR_PIN_LENGTH) {
        return;
      }

      setVerifying(true);
      setError(false);
      setErrorMessage('');

      const result = await verifyUnlockPin(value);
      setVerifying(false);

      if (result.ok) {
        setMonitoringPinUnlocked(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(MONITORING_HOME_ROUTE);
        return;
      }

      if (result.reason === 'missing_pin') {
        autoSubmitRef.current = false;
        setPin('');
        router.replace('/inverter/create-pin');
        return;
      }

      if (result.reason === 'no_user') {
        autoSubmitRef.current = false;
        setPin('');
        setError(true);
        setErrorMessage('Session expired. Sign in again with your email.');
        return;
      }

      setAttempts((prev) => {
        const nextAttempts = prev + 1;
        handleWrongPin(nextAttempts);
        return nextAttempts;
      });
    },
    [handleWrongPin, locked, pinReady, verifyUnlockPin, verifying],
  );

  const handlePinComplete = useCallback(
    (value: string) => {
      if (autoSubmitRef.current || locked || verifying || pinReady === false) return;
      autoSubmitRef.current = true;
      void submitPin(value);
    },
    [locked, pinReady, submitPin, verifying],
  );

  const handleForgotPin = useCallback(async () => {
    if (!user?.id) return;
    const email = user.email?.trim().toLowerCase();
    if (!email) return;

    clearMonitoringPinSession();
    await clearOperatorPin(user.id);
    await clearMonitoringHasPin();
    router.replace({ pathname: '/inverter/otp', params: { email, recovery: 'pin' } });
  }, [user]);

  const handleBack = useCallback(() => {
    router.replace('/inverter/sign-in');
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={INVERTER_AUTH.BG_PRIMARY} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.header}>
          <AuthPressable onPress={handleBack} hitSlop={12} accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color={INVERTER_AUTH.TEAL} />
          </AuthPressable>
        </View>

        <View style={styles.centered}>
          <View style={styles.contentBlock}>
            <View style={styles.iconWrap}>
              <TealPulseIcon size={56}>
                <Activity color={INVERTER_AUTH.TEAL} size={24} strokeWidth={2.2} />
              </TealPulseIcon>
            </View>

            <Text style={styles.heading}>Welcome back.</Text>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.subtext}>
              Enter your PIN to access Inverter Monitoring.
            </Text>

            <View style={styles.pinWrap}>
              <PinBoxes
                value={pin}
                length={OPERATOR_PIN_LENGTH}
                variant="unlock"
                onChange={(v) => {
                  setPin(v);
                  if (error && !locked) {
                    setError(false);
                    setErrorMessage('');
                  }
                  if (v.length < OPERATOR_PIN_LENGTH) autoSubmitRef.current = false;
                }}
                onComplete={handlePinComplete}
                shakeStyle={shakeStyle}
                error={error}
                disabled={locked || pinReady !== true}
                loading={verifying}
                centered
              />
            </View>

            <Animated.Text style={[styles.hint, hintStyle]} pointerEvents="none">
              Tap a number to begin
            </Animated.Text>

            {locked ? (
              <Text style={styles.lockout}>
                Too many attempts. Try again in 0:{String(lockoutSeconds).padStart(2, '0')}.
              </Text>
            ) : errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <AuthPressable
              onPress={() => void handleForgotPin()}
              accessibilityRole="button"
              style={styles.forgotWrap}
            >
              <Text style={styles.forgot}>Forgot PIN? Verify email again.</Text>
            </AuthPressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: INVERTER_AUTH.BG_PRIMARY,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentBlock: {
    alignItems: 'center',
    width: '100%',
  },
  iconWrap: {
    marginBottom: 28,
    alignItems: 'center',
  },
  heading: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.semibold,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  name: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.bold,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  subtext: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 260,
    marginTop: 10,
    marginBottom: 28,
  },
  pinWrap: {
    width: '100%',
    alignItems: 'center',
  },
  hint: {
    color: INVERTER_AUTH.TEXT_DISABLED,
    fontFamily: inter.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  error: {
    color: INVERTER_AUTH.ERROR,
    fontFamily: inter.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  lockout: {
    color: INVERTER_AUTH.TEAL,
    fontFamily: inter.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  forgotWrap: {
    marginTop: 28,
  },
  forgot: {
    color: INVERTER_AUTH.TEAL,
    fontFamily: inter.regular,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
