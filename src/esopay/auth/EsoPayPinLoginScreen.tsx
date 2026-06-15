import { runWrongPinShake } from '@/lib/motion/springMotion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinVaultDots } from '@/esopay/components/pin/PinVaultDots';
import { PinVaultKeypad } from '@/esopay/components/pin/PinVaultKeypad';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import {
  formatEsoPayFirstName,
  getEsoPayUserEmail,
  getEsoPayUserName,
  initialsFromName,
} from '@/esopay/storage/esoPayUserProfileStorage';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { ds } from '@/esopay/theme/designSystem';
import { inter } from '@/theme/fonts';
const SURFACE = '#0D1018';
const GOLD = '#C9A84C';
const TEXT_PRIMARY = '#F5F0E8';
const TEXT_SECONDARY = '#6B7280';
const EMAIL_COLOR = '#4A5568';
const ERROR = '#EF4444';
const SHAKE_MS = 400;
const AVATAR_SUCCESS_SPRING = { damping: 14, stiffness: 200, mass: 0.9 };
const LOCAL_LOCK_SECONDS = 30;
const LOCAL_MAX_ATTEMPTS = 5;

type Props = {
  onUnlockSuccess: () => void;
  onForgotPin: () => void;
  recoverySending?: boolean;
  bannerError?: string | null;
};

function useLockoutCountdown(lockedUntil: string | null, localUntilMs: number | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let remaining = 0;
      if (lockedUntil) {
        remaining = Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - now) / 1000));
      } else if (localUntilMs) {
        remaining = Math.max(0, Math.ceil((localUntilMs - now) / 1000));
      }
      setSecondsLeft(remaining);
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [localUntilMs, lockedUntil]);

  return { secondsLeft, active: secondsLeft > 0 };
}

export function EsoPayPinLoginScreen({
  onUnlockSuccess,
  onForgotPin,
  recoverySending,
  bannerError,
}: Props) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion() ?? false;

  const { locked, lockedUntil, verifyPin } = useTransactionPin();
  const authUser = useEsoPayAuthStore((s) => s.user);

  const displayName =
    getEsoPayUserName() ||
    (authUser?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ||
    (authUser?.user_metadata as { name?: string } | undefined)?.name ||
    authUser?.email?.split('@')[0];
  const displayEmail = getEsoPayUserEmail() || authUser?.email || undefined;
  const firstName = formatEsoPayFirstName(displayName);
  const initials = initialsFromName(displayName);

  const [pin, setPin] = useState('');
  const [pinErrorFlash, setPinErrorFlash] = useState(false);
  const [pinErrorMessage, setPinErrorMessage] = useState<string | null>(null);
  const [localFailCount, setLocalFailCount] = useState(0);
  const [localLockUntilMs, setLocalLockUntilMs] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successAnimating, setSuccessAnimating] = useState(false);

  const biometricTried = useRef(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const dotsShakeX = useSharedValue(0);
  const avatarScale = useSharedValue(1);
  const errorOpacity = useSharedValue(0);

  const { secondsLeft, active: lockoutActive } = useLockoutCountdown(
    locked ? lockedUntil : null,
    localLockUntilMs,
  );

  const keypadDisabled =
    submitting || successAnimating || lockoutActive || locked || recoverySending || pinErrorFlash;

  const dotsShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dotsShakeX.value }],
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const pinErrorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  const runShake = useCallback(() => {
    if (reduceMotion) return;
    runWrongPinShake(dotsShakeX);
  }, [dotsShakeX, reduceMotion]);

  const showPinErrorText = useCallback(
    (message: string) => {
      setPinErrorMessage(message);
      if (reduceMotion) {
        errorOpacity.value = 1;
        return;
      }
      errorOpacity.value = 0;
      errorOpacity.value = withTiming(1, { duration: 200 });
    },
    [errorOpacity, reduceMotion],
  );

  const clearPinErrorText = useCallback(() => {
    setPinErrorMessage(null);
    errorOpacity.value = 0;
  }, [errorOpacity]);

  const runSuccess = useCallback(() => {
    setSuccessAnimating(true);
    if (reduceMotion) {
      onUnlockSuccess();
      return;
    }
    avatarScale.value = withSpring(1.12, AVATAR_SUCCESS_SPRING, (finished) => {
      if (finished) {
        avatarScale.value = withSpring(1, AVATAR_SUCCESS_SPRING);
      }
    });
    setTimeout(() => onUnlockSuccess(), 420);
  }, [avatarScale, onUnlockSuccess, reduceMotion]);

  const runBiometricAuth = useCallback(async () => {
    if (keypadDisabled) return;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Eso Pay',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: true,
      });

      if (result.success) {
        useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        runSuccess();
      }
    } catch {
      // PIN pad remains the fallback.
    }
  }, [keypadDisabled, runSuccess]);

  useEffect(() => {
    void (async () => {
      try {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const hardware = await LocalAuthentication.hasHardwareAsync();
        if (hardware && enrolled) {
          biometricTried.current = false;
        }
      } catch {
        // Biometrics unavailable.
      }
    })();
  }, []);

  const tryBiometricOnMount = useCallback(async () => {
    if (biometricTried.current || keypadDisabled) return;
    biometricTried.current = true;
    await runBiometricAuth();
  }, [keypadDisabled, runBiometricAuth]);

  useEffect(() => {
    void tryBiometricOnMount();
  }, [tryBiometricOnMount]);

  const handleWrongPin = useCallback(
    (_remaining: number | null) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPinErrorFlash(true);
      runShake();

      const nextLocalFails = localFailCount + 1;
      setLocalFailCount(nextLocalFails);

      setTimeout(() => {
        setPin('');
        setPinErrorFlash(false);

        if (nextLocalFails >= LOCAL_MAX_ATTEMPTS && !locked) {
          setLocalLockUntilMs(Date.now() + LOCAL_LOCK_SECONDS * 1000);
          clearPinErrorText();
          return;
        }

        showPinErrorText('Incorrect PIN. Try again.');
      }, SHAKE_MS);
    },
    [clearPinErrorText, localFailCount, locked, runShake, showPinErrorText],
  );

  const submitPin = useCallback(
    async (value: string) => {
      if (keypadDisabled || value.length !== TRANSACTION_PIN_LENGTH) return;
      setSubmitting(true);
      clearPinErrorText();

      const result = await verifyPin(value);
      setSubmitting(false);

      if (result.ok) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setLocalFailCount(0);
        setLocalLockUntilMs(null);
        runSuccess();
        return;
      }

      if (result.locked) {
        setLocalLockUntilMs(Date.now() + LOCAL_LOCK_SECONDS * 1000);
        setPin('');
        clearPinErrorText();
        return;
      }

      handleWrongPin(result.attemptsRemaining);
    },
    [clearPinErrorText, handleWrongPin, keypadDisabled, runSuccess, verifyPin],
  );

  const appendDigit = useCallback(
    (digit: string) => {
      if (keypadDisabled || pin.length >= TRANSACTION_PIN_LENGTH) return;
      clearPinErrorText();
      const next = `${pin}${digit}`;
      setPin(next);
      if (next.length === TRANSACTION_PIN_LENGTH) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        void submitPin(next);
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [clearPinErrorText, keypadDisabled, pin, submitPin],
  );

  const handleBackspace = useCallback(() => {
    if (keypadDisabled || !pin) return;
    void Haptics.selectionAsync();
    clearPinErrorText();
    setPin(pin.slice(0, -1));
  }, [clearPinErrorText, keypadDisabled, pin]);

  const lockoutMessage = useMemo(() => {
    if (!lockoutActive) return null;
    return `Too many attempts. Try again in ${secondsLeft} second${secondsLeft === 1 ? '' : 's'}`;
  }, [lockoutActive, secondsLeft]);

  useEffect(() => {
    if (!lockoutActive && localLockUntilMs && Date.now() >= localLockUntilMs) {
      setLocalLockUntilMs(null);
      setLocalFailCount(0);
    }
  }, [lockoutActive, localLockUntilMs, secondsLeft]);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 16 }]}>
      <View pointerEvents="none" style={styles.glow} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.avatar, avatarStyle]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </Animated.View>

        <Text style={styles.brandLabel}>ESO PAY</Text>

        <Text style={styles.welcomeLead}>Welcome back,</Text>
        <Text style={styles.welcomeName}>{firstName}</Text>

        {displayEmail ? <Text style={styles.email}>{displayEmail}</Text> : null}

        <Text style={styles.instruction}>Enter your 6-digit PIN</Text>

        {bannerError ? (
          <Text style={[styles.bannerError, styles.messageSlot]} accessibilityLiveRegion="polite">
            {bannerError}
          </Text>
        ) : null}

        <PinVaultDots
          filledCount={pin.length}
          errorFlash={pinErrorFlash}
          shakeStyle={dotsShakeStyle}
          style={styles.dots}
        />

        <View style={styles.messageSlot}>
          {lockoutMessage ? (
            <Text style={styles.lockoutError} accessibilityLiveRegion="polite">
              {lockoutMessage}
            </Text>
          ) : pinErrorMessage ? (
            <Animated.Text
              style={[styles.pinError, pinErrorStyle]}
              accessibilityLiveRegion="polite"
            >
              {pinErrorMessage}
            </Animated.Text>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <PinVaultKeypad
          onDigit={appendDigit}
          onBackspace={handleBackspace}
          disabled={keypadDisabled}
          backspaceDisabled={pin.length === 0}
        />

        <Pressable
          onPress={onForgotPin}
          disabled={recoverySending || keypadDisabled}
          style={styles.forgotRow}
          accessibilityRole="button"
          accessibilityLabel="Forgot PIN"
        >
          {recoverySending ? (
            <ActivityIndicator size="small" color={GOLD} />
          ) : (
            <Text style={[styles.forgotText, keypadDisabled && styles.forgotDisabled]}>
              Forgot PIN?
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ds.color.bg,
  },
  glow: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(201, 168, 76, 0.03)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  footer: {
    width: '100%',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginTop: 64,
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 168, 76, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatarText: {
    fontFamily: inter.bold,
    fontSize: 24,
    fontWeight: '700',
    color: GOLD,
  },
  brandLabel: {
    fontFamily: inter.semibold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    color: GOLD,
    marginTop: 20,
    textAlign: 'center',
  },
  welcomeLead: {
    fontFamily: inter.regular,
    fontSize: 16,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
  welcomeName: {
    fontFamily: inter.bold,
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  email: {
    fontFamily: inter.regular,
    fontSize: 13,
    color: EMAIL_COLOR,
    marginTop: 4,
    textAlign: 'center',
  },
  instruction: {
    fontFamily: inter.regular,
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 20,
    textAlign: 'center',
  },
  dots: {
    marginTop: 0,
  },
  messageSlot: {
    minHeight: 20,
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pinError: {
    fontFamily: inter.regular,
    fontSize: 13,
    color: ERROR,
    textAlign: 'center',
  },
  lockoutError: {
    fontFamily: inter.regular,
    fontSize: 13,
    color: ERROR,
    textAlign: 'center',
  },
  bannerError: {
    fontFamily: inter.regular,
    fontSize: 13,
    color: ERROR,
    textAlign: 'center',
    marginTop: 8,
  },
  forgotRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 24,
  },
  forgotText: {
    fontFamily: inter.regular,
    fontSize: 13,
    color: GOLD,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  forgotDisabled: {
    opacity: 0.4,
  },
});
