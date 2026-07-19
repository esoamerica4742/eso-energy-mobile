import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { sendEsoPayEmailOtp, verifyEsoPayEmailOtp } from '@/lib/authOtp';
import { isEsoPayProfileComplete } from '@/lib/authProfile';
import { paramString } from '@/lib/authRouteParams';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { ESOPAY_PIN_SETUP_ROUTE } from '@/lib/navigation/productRoutes';
import { resolveEsoPayLaunchRoute } from '@/esopay/navigation/resolveEsoPayLaunchRoute';
import { ds } from '@/esopay/theme/designSystem';
import { ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import {
  completeEsoPayEmailSignIn,
  establishEsoPaySession,
} from '@/esopay/auth/syncEsoPaySession';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { beginEsoPayPinRecovery } from '@/esopay/lib/pinRecovery';
import { clearTransactionPin } from '@/esopay/storage/transactionPin';
import { GOLD } from '@/theme/colors';
const EMPTY_OTP = ['', '', '', '', '', ''];

export default function EsoPayOtpVerification() {
  const params = useLocalSearchParams();
  const email = paramString(params.email);
  const recovery = paramString(params.recovery);
  const isPinRecovery = recovery === 'pin';
  const insets = useSafeAreaInsets();
  const lockSession = useEsoPayAuthStore((s) => s.setPinSessionUnlocked);
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState<string[]>([...EMPTY_OTP]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const otpValue = otp.join('');
  const isComplete = otpValue.length === 6;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    setCanResend(true);
  }, [countdown]);

  const handleOtpChange = useCallback((value: string) => {
    const digits = value.replace(/[^0-9]/g, '').split('');
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 6) newOtp[i] = d;
    });
    setOtp(newOtp);
    setActiveIndex(Math.min(digits.length, 5));
    if (errorMsg) setErrorMsg('');
  }, [errorMsg]);

  const handleVerify = useCallback(async () => {
    if (otpValue.length !== 6 || !email) return;

    setIsLoading(true);
    setErrorMsg('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await verifyEsoPayEmailOtp(email, otpValue);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMsg(result.error);
      setOtp([...EMPTY_OTP]);
      setActiveIndex(0);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setLastProduct('esopay');

    if (isPinRecovery && isEsoPayProfileComplete(result.user)) {
      try {
        await completeEsoPayEmailSignIn(result.session);
      } catch (syncErr) {
        setErrorMsg(
          syncErr instanceof Error ? syncErr.message : 'Could not start your Eso Pay session.',
        );
        setOtp([...EMPTY_OTP]);
        setActiveIndex(0);
        return;
      }
      const userId = result.user?.id;
      if (userId) await clearTransactionPin(userId);
      try {
        await beginEsoPayPinRecovery();
      } catch (recoveryErr) {
        setErrorMsg(
          recoveryErr instanceof Error
            ? recoveryErr.message
            : 'Could not start PIN recovery. Try again.',
        );
        setOtp([...EMPTY_OTP]);
        setActiveIndex(0);
        return;
      }
      lockSession(false);
      router.replace({
        pathname: ESOPAY_PIN_SETUP_ROUTE.pathname,
        params: { ...ESOPAY_PIN_SETUP_ROUTE.params, recovery: '1' },
      });
      return;
    }

    if (isEsoPayProfileComplete(result.user)) {
      try {
        await completeEsoPayEmailSignIn(result.session);
      } catch (syncErr) {
        setErrorMsg(
          syncErr instanceof Error ? syncErr.message : 'Could not start your Eso Pay session.',
        );
        setOtp([...EMPTY_OTP]);
        setActiveIndex(0);
        return;
      }
      await setOnboardingComplete();
      const userId = result.user?.id;
      lockSession(false);
      router.replace(await resolveEsoPayLaunchRoute(userId));
      return;
    }

    try {
      await establishEsoPaySession(result.session);
    } catch (syncErr) {
      setErrorMsg(
        syncErr instanceof Error ? syncErr.message : 'Could not start your Eso Pay session.',
      );
      setOtp([...EMPTY_OTP]);
      setActiveIndex(0);
      return;
    }

    router.push({ pathname: '/auth/register', params: { email, module: 'esopay' } });
  }, [email, isPinRecovery, lockSession, otpValue]);

  const handleResend = useCallback(async () => {
    if (!email || resending || !canResend) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResending(true);
    setErrorMsg('');

    const result = await sendEsoPayEmailOtp(email);
    setResending(false);

    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }

    setCountdown(60);
    setCanResend(false);
    setOtp([...EMPTY_OTP]);
    setActiveIndex(0);
    inputRef.current?.focus();
  }, [canResend, email, resending]);

  const resendLabel = countdown < 10 ? `0${countdown}` : String(countdown);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={ds.color.bg} />

      <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.headerRow, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => router.push('/auth/sign-in')}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft color={GOLD} size={22} />
          </TouchableOpacity>
          <Text style={styles.stepText}>2 of 3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={styles.progressFilled} />
          <View style={styles.progressFilled} />
          <View style={styles.progressUnfilled} />
        </View>

        <Text style={styles.headline}>Check your email.</Text>

        <View style={styles.emailPill}>
          <Mail color={GOLD} stroke={GOLD} size={16} />
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/sign-in')} accessibilityRole="button">
          <Text style={styles.wrongEmailLink}>Wrong email?</Text>
        </TouchableOpacity>

        <Text style={styles.instructionPrimary}>Enter the 6-digit code we sent.</Text>
        <Text style={styles.instructionSecondary}>
          Check spam and promotions if code doesn&apos;t arrive.
        </Text>

        <View style={styles.middleSection}>
          <TouchableOpacity
            style={styles.otpRow}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
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
                  ]}
                >
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}
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
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            textContentType="oneTimeCode"
            caretHidden
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              { backgroundColor: isComplete ? GOLD : 'rgba(255,255,255,0.08)' },
            ]}
            onPress={() => void handleVerify()}
            disabled={!isComplete || isLoading}
            accessibilityRole="button"
            accessibilityLabel="Verify Code"
          >
            <Text
              style={[
                styles.verifyButtonText,
                { color: isComplete ? '#000000' : 'rgba(255,255,255,0.3)' },
              ]}
            >
              Verify Code →
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonGap} />

          <View style={styles.bottomFooter}>
            <View style={styles.expiresRow}>
              <Clock color={GOLD} size={14} />
              <Text style={styles.expiresText}>Code expires in 10 minutes</Text>
            </View>

            <View>
              {canResend ? (
                <TouchableOpacity onPress={() => void handleResend()} disabled={resending}>
                  <Text style={styles.resendActive}>{resending ? 'Sending…' : 'Resend code'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendTimer}>Resend code in 0:{resendLabel}</Text>
              )}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ds.color.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    color: ESO_PAY_TEXT_SECONDARY,
    fontSize: 13,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 32,
  },
  progressFilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  progressUnfilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 20,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  emailText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  wrongEmailLink: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  instructionPrimary: {
    color: ESO_PAY_TEXT_SECONDARY,
    fontSize: 15,
    marginBottom: 6,
  },
  instructionSecondary: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginBottom: 28,
  },
  middleSection: {
    flex: 1,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0D1117',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  otpBoxFilled: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: '#131920',
  },
  otpBoxEmpty: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  otpDigit: {
    color: '#F5F0E8',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 12,
  },
  bottomFooter: {
    marginBottom: 32,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  expiresText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  resendActive: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
  },
  resendTimer: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  buttonGap: {
    height: 40,
  },
  verifyButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bottomSpacer: {
    flex: 1,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
