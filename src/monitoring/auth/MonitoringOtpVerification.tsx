import { useCallback, useEffect, useRef, useState } from 'react';
import {
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Mail } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { establishMonitoringSession, isMonitoringProfileComplete } from '@/lib/authProfile';
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authOtp';
import { paramString } from '@/lib/authRouteParams';
import { signOutEsoPay } from '@/esopay/auth/signOutEsoPay';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { MONITORING_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import { inter } from '@/theme/fonts';

const EMPTY_OTP = ['', '', '', '', '', ''];

const OTP_THEME = {
  bg: '#0A0F1E',
  card: '#1A2035',
  gold: '#F5A623',
  muted: 'rgba(255,255,255,0.4)',
  helper: 'rgba(255,255,255,0.35)',
  subtext: 'rgba(255,255,255,0.55)',
  buttonText: '#000000',
  disabledBg: 'rgba(255,255,255,0.08)',
  disabledText: 'rgba(255,255,255,0.45)',
  track: 'rgba(255,255,255,0.2)',
} as const;

export default function MonitoringOtpVerification() {
  const params = useLocalSearchParams();
  const email = paramString(params.email);
  const module = paramString(params.module) || 'inverter';
  const recovery = paramString(params.recovery);
  const isPinRecovery = recovery === 'pin';
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState<string[]>([...EMPTY_OTP]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const shake = useSharedValue(0);

  const otpValue = otp.join('');
  const isComplete = otpValue.length === 6;
  const canResend = seconds <= 0;

  useEffect(() => {
    setOtp([...EMPTY_OTP]);
    setActiveIndex(0);
    setErrorMsg('');
    let cancelled = false;
    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      focusTimer = setTimeout(() => {
        if (!cancelled) inputRef.current?.focus();
      }, 200);
    });
    return () => {
      cancelled = true;
      task.cancel();
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [email]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerShake = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [shake]);

  const flashSuccess = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleOtpChange = useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, '').split('');
      const newOtp = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      if (digits.length > otpValue.length) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setOtp(newOtp);
      setActiveIndex(Math.min(digits.length, 5));
      if (errorMsg) setErrorMsg('');
    },
    [errorMsg, otpValue.length],
  );

  const handleVerify = useCallback(async () => {
    if (otpValue.length !== 6 || !email) return;
    setIsLoading(true);
    setErrorMsg('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await verifyEmailOtp(email, otpValue);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMsg(result.error);
      triggerShake();
      setOtp([...EMPTY_OTP]);
      setActiveIndex(0);
      return;
    }

    flashSuccess();
    await new Promise((r) => setTimeout(r, 400));

    await setLastProduct('monitoring');
    await signOutEsoPay();

    try {
      await establishMonitoringSession(result.session);
    } catch (syncErr) {
      setErrorMsg(
        syncErr instanceof Error ? syncErr.message : 'Could not start your monitoring session.',
      );
      triggerShake();
      setOtp([...EMPTY_OTP]);
      setActiveIndex(0);
      return;
    }

    if (isMonitoringProfileComplete(result.user)) {
      await setOnboardingComplete();
      router.replace(MONITORING_HOME_ROUTE);
      return;
    }

    router.push({ pathname: '/auth/register', params: { email, module } });
  }, [email, flashSuccess, module, otpValue, triggerShake]);

  const autoVerifyRef = useRef(false);
  useEffect(() => {
    if (otpValue.length !== 6 || isLoading || autoVerifyRef.current) return;
    autoVerifyRef.current = true;
    void handleVerify().finally(() => {
      autoVerifyRef.current = false;
    });
  }, [otpValue, isLoading, handleVerify]);

  const handleResend = useCallback(async () => {
    if (!email || resending || !canResend) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResending(true);
    setErrorMsg('');

    const result = await sendEmailOtp(email);
    setResending(false);

    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }

    setSeconds(30);
    setOtp([...EMPTY_OTP]);
    setActiveIndex(0);
    inputRef.current?.focus();
  }, [canResend, email, resending]);

  const resendLabel = seconds < 10 ? `0${seconds}` : String(seconds);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={OTP_THEME.bg} />

      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.main}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft color={OTP_THEME.gold} size={22} />
            </TouchableOpacity>
            <Text style={styles.stepText}>2 of 3</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFilled} />
            <View style={styles.progressFilled} />
            <View style={styles.progressUnfilled} />
          </View>

          <Text style={styles.headline}>
            {isPinRecovery ? 'Verify to reset PIN.' : 'Check your email.'}
          </Text>

          <View style={styles.emailPill}>
            <Mail color={OTP_THEME.gold} stroke={OTP_THEME.gold} size={16} />
            <Text style={styles.emailText}>{email}</Text>
          </View>

          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.wrongEmailLink}>Wrong email?</Text>
          </TouchableOpacity>

          <Text style={styles.instructionPrimary}>
            {isPinRecovery
              ? 'Enter the code we sent to create a new transaction PIN.'
              : 'Enter the 6-digit code we sent.'}
          </Text>

          <Text style={styles.instructionSecondary}>
            Check spam and promotions if code doesn&apos;t arrive.
          </Text>

          <View style={styles.otpSection}>
            <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
              <Animated.View style={[styles.otpRow, shakeStyle]}>
                {otp.map((digit, index) => {
                  const isActive = index === activeIndex;
                  const isFilled = Boolean(digit);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        isActive
                          ? styles.otpBoxActive
                          : isFilled
                            ? styles.otpBoxFilled
                            : styles.otpBoxEmpty,
                        Boolean(errorMsg) && styles.otpBoxError,
                      ]}
                    >
                      <Text style={styles.otpDigit}>{digit}</Text>
                    </View>
                  );
                })}
              </Animated.View>
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={6}
              value={otpValue}
              onChangeText={handleOtpChange}
              autoFocus
              showSoftInputOnFocus
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
              textContentType="oneTimeCode"
              importantForAutofill="yes"
              autoCorrect={false}
              autoCapitalize="none"
              caretHidden
            />
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              { backgroundColor: isComplete ? OTP_THEME.gold : OTP_THEME.disabledBg },
            ]}
            onPress={() => void handleVerify()}
            disabled={!isComplete || isLoading}
            accessibilityRole="button"
            accessibilityLabel="Verify Code"
            activeOpacity={isComplete ? 0.85 : 1}
          >
            <Text
              style={[
                styles.verifyButtonText,
                { color: isComplete ? OTP_THEME.buttonText : OTP_THEME.disabledText },
              ]}
            >
              Verify Code →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.expiresRow}>
            <Clock color={OTP_THEME.muted} size={14} />
            <Text style={styles.expiresText}>Code expires in 10 minutes</Text>
          </View>

          {canResend ? (
            <TouchableOpacity onPress={() => void handleResend()} disabled={resending}>
              <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend code'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>Resend code in 0:{resendLabel}</Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: OTP_THEME.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  main: {
    flexShrink: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    color: OTP_THEME.gold,
    fontSize: 13,
    fontFamily: inter.medium,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 24,
  },
  progressFilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: OTP_THEME.gold,
  },
  progressUnfilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: OTP_THEME.track,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: inter.bold,
    lineHeight: 38,
    marginBottom: 16,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: OTP_THEME.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emailText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: inter.medium,
  },
  wrongEmailLink: {
    color: OTP_THEME.gold,
    fontSize: 14,
    fontFamily: inter.semibold,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  instructionPrimary: {
    color: OTP_THEME.subtext,
    fontSize: 15,
    fontFamily: inter.regular,
    lineHeight: 22,
    marginBottom: 6,
  },
  instructionSecondary: {
    color: OTP_THEME.helper,
    fontSize: 13,
    fontFamily: inter.regular,
    lineHeight: 18,
    marginBottom: 20,
  },
  otpSection: {
    position: 'relative',
    marginBottom: 16,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  otpBox: {
    flex: 1,
    maxWidth: 52,
    height: 56,
    borderRadius: 12,
    backgroundColor: OTP_THEME.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: OTP_THEME.gold,
  },
  otpBoxFilled: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  otpBoxEmpty: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  otpBoxError: {
    borderColor: '#FF4444',
  },
  otpDigit: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: inter.bold,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    left: 0,
    top: 0,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 13,
    fontFamily: inter.regular,
    textAlign: 'center',
    marginBottom: 12,
  },
  verifyButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: inter.bold,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  expiresText: {
    color: OTP_THEME.muted,
    fontSize: 13,
    fontFamily: inter.regular,
  },
  resendLink: {
    color: OTP_THEME.gold,
    fontSize: 14,
    fontFamily: inter.semibold,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  resendTimer: {
    color: OTP_THEME.muted,
    fontSize: 14,
    fontFamily: inter.regular,
    textAlign: 'center',
  },
});
