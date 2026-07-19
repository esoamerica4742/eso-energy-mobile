import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { isMonitoringProfileComplete } from '@/lib/authProfile';
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authOtp';
import { paramString } from '@/lib/authRouteParams';
import { establishUnifiedSession } from '@/master/unifiedSession';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { MONITORING_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import { useAuth } from '@/hooks/useAuth';
import { inter } from '@/theme/fonts';

const COLORS = {
  background: '#000000',
  card: '#1C1C1E',
  gold: '#FFFFFF',
  white: '#FFFFFF',
  grey: 'rgba(255,255,255,0.55)',
  borderInactive: 'rgba(255,255,255,0.12)',
  borderActive: 'rgba(255,255,255,0.55)',
  error: '#FF6B6B',
  buttonDisabled: '#2C2C2E',
} as const;

const OTP_LENGTH = 6;

function normalizeRouteEmail(value: string, fallback = ''): string {
  const raw = (value || fallback).trim().toLowerCase();
  return raw;
}

export default function OTPVerificationScreen() {
  const params = useLocalSearchParams();
  const { email: persistedEmail } = useAuth();
  const email = normalizeRouteEmail(paramString(params.email), persistedEmail);
  const module = paramString(params.module) || 'inverter';
  const recovery = paramString(params.recovery);
  const isPinRecovery = recovery === 'pin';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const verifyLockRef = useRef(false);
  const shake = useSharedValue(0);

  const isComplete = otp.length === OTP_LENGTH;

  useEffect(() => {
    setOtp('');
    setError('');
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
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [resendTimer]);

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

  const handleOtpChange = useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (digits.length > otp.length) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (digits.length < OTP_LENGTH) {
        verifyLockRef.current = false;
      }
      setOtp(digits);
      if (error) setError('');
    },
    [error, otp.length],
  );

  const handleVerify = useCallback(async () => {
    if (otp.length < OTP_LENGTH || !email || verifyLockRef.current || loading) return;

    const code = otp;
    verifyLockRef.current = true;
    setLoading(true);
    setError('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await verifyEmailOtp(email, code);
    if (!result.ok) {
      verifyLockRef.current = false;
      setLoading(false);
      setError(result.error);
      setOtp('');
      triggerShake();
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 400));

    try {
      await setLastProduct('monitoring');
      await establishUnifiedSession(result.session);

      if (isMonitoringProfileComplete(result.user)) {
        await setOnboardingComplete();
        router.replace(MONITORING_HOME_ROUTE);
        return;
      }

      router.push({ pathname: '/auth/register', params: { email, module } });
    } catch (sessionErr) {
      verifyLockRef.current = false;
      setError(
        sessionErr instanceof Error
          ? sessionErr.message
          : 'Could not start your monitoring session.',
      );
      setOtp('');
      triggerShake();
    } finally {
      setLoading(false);
    }
  }, [email, loading, module, otp, triggerShake]);

  const handleResend = useCallback(async () => {
    if (!email || resending || !canResend) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResending(true);
    setError('');

    const result = await sendEmailOtp(email);
    setResending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setResendTimer(60);
    setCanResend(false);
    verifyLockRef.current = false;
    setOtp('');
    inputRef.current?.focus();
  }, [canResend, email, resending]);

  const activeIndex = Math.min(otp.length, OTP_LENGTH - 1);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft color={COLORS.gold} size={22} />
            </TouchableOpacity>
            <Text style={styles.stepText}>2 of 3</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFilled} />
            <View style={styles.progressFilled} />
            <View style={styles.progressUnfilled} />
          </View>

          <Text style={styles.heading}>
            {isPinRecovery ? 'Verify to reset PIN.' : 'Check your email.'}
          </Text>

          <View style={styles.emailPill}>
            <Mail color={COLORS.gold} stroke={COLORS.gold} size={16} />
            <Text style={styles.emailText}>{email}</Text>
          </View>

          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.wrongEmailLink}>Wrong email?</Text>
          </TouchableOpacity>

          <Text style={styles.subtitlePrimary}>
            {isPinRecovery
              ? 'Enter the code we sent to create a new transaction PIN.'
              : 'Enter the 6-digit code we sent.'}
          </Text>
          <Text style={styles.subtitleSecondary}>
            Check spam and promotions if code doesn&apos;t arrive.
          </Text>

          <View style={styles.otpSection}>
            <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
              <Animated.View style={[styles.otpRow, shakeStyle]}>
                {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                  const isActive = index === activeIndex;
                  const char = otp[index] ?? '';
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        {
                          borderColor: isActive ? COLORS.borderActive : COLORS.borderInactive,
                        },
                      ]}
                    >
                      <Text style={styles.otpDigit}>{char}</Text>
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
              maxLength={OTP_LENGTH}
              value={otp}
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              {
                backgroundColor:
                  isComplete && !loading ? COLORS.gold : COLORS.buttonDisabled,
              },
            ]}
            onPress={() => void handleVerify()}
            disabled={!isComplete || loading}
            accessibilityRole="button"
            accessibilityLabel="Verify Code"
            activeOpacity={isComplete ? 0.85 : 1}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text
                style={[
                  styles.verifyButtonText,
                  { color: isComplete ? COLORS.background : COLORS.grey },
                ]}
              >
                Verify Code →
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.expiryResendBlock}>
            <View style={styles.expiresRow}>
              <Clock color={COLORS.grey} size={14} />
              <Text style={styles.expiresText}>Code expires in 10 minutes</Text>
            </View>

            <TouchableOpacity disabled={!canResend || resending} onPress={() => void handleResend()}>
              <Text
                style={[
                  styles.resendText,
                  {
                    color: canResend ? COLORS.gold : COLORS.grey,
                    textDecorationLine: canResend ? 'underline' : 'none',
                  },
                ]}
              >
                {canResend
                  ? resending
                    ? 'Sending…'
                    : 'Resend code'
                  : `Resend in 0:${String(resendTimer).padStart(2, '0')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 0,
    paddingBottom: 24,
  },
  safe: {
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    color: COLORS.gold,
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
    backgroundColor: COLORS.gold,
  },
  progressUnfilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.borderInactive,
  },
  heading: {
    color: COLORS.white,
    fontSize: 32,
    fontFamily: inter.bold,
    lineHeight: 38,
    marginBottom: 16,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emailText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: inter.medium,
  },
  wrongEmailLink: {
    color: COLORS.gold,
    fontSize: 14,
    fontFamily: inter.semibold,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  subtitlePrimary: {
    color: COLORS.grey,
    fontSize: 15,
    fontFamily: inter.regular,
    lineHeight: 22,
    marginBottom: 6,
  },
  subtitleSecondary: {
    color: COLORS.grey,
    fontSize: 13,
    fontFamily: inter.regular,
    lineHeight: 18,
    marginBottom: 20,
  },
  otpSection: {
    position: 'relative',
    marginBottom: 12,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 52,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    color: COLORS.white,
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
    color: COLORS.error,
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
    justifyContent: 'center',
    minHeight: 52,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: inter.bold,
  },
  expiryResendBlock: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expiresText: {
    color: COLORS.grey,
    fontSize: 13,
    fontFamily: inter.regular,
  },
  resendText: {
    fontSize: 14,
    fontFamily: inter.semibold,
    textAlign: 'center',
  },
});
