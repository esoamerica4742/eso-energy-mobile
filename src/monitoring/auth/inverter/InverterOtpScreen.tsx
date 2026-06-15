import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { establishMonitoringSession } from '@/lib/authProfile';
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authOtp';
import { paramString } from '@/lib/authRouteParams';
import { hasOperatorPin } from '@/lib/monitoring/operatorPin';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { signOutEsoPay } from '@/esopay/auth/signOutEsoPay';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { inter } from '@/theme/fonts';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import { MonitoringTealButton } from '@/monitoring/auth/inverter/MonitoringAuthChrome';
import { resolveMonitoringAuthRoute } from '@/monitoring/auth/inverter/monitoringAuthRoute';
import { saveMonitoringHasPin } from '@/monitoring/auth/inverter/monitoringUserPin';
import { clearMonitoringPinSession } from '@/monitoring/auth/monitoringPinSession';
import { OtpBoxes } from '@/monitoring/auth/inverter/OtpBoxes';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function normalizeEmail(value: string, fallback = ''): string {
  return (value || fallback).trim().toLowerCase();
}

export default function InverterOtpScreen() {
  const params = useLocalSearchParams();
  const { email: persistedEmail } = useAuth();
  const email = normalizeEmail(paramString(params.email), persistedEmail);
  const isPinRecovery = paramString(params.recovery) === 'pin';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const verifyLockRef = useRef(false);
  const recoveryOtpSentRef = useRef(false);
  const shake = useSharedValue(0);

  const isComplete = otp.length === OTP_LENGTH;
  const canResend = resendSeconds <= 0;

  useEffect(() => {
    setOtp('');
    setError('');
  }, [email]);

  useEffect(() => {
    if (!isPinRecovery || !email || recoveryOtpSentRef.current) return;
    recoveryOtpSentRef.current = true;

    void (async () => {
      setResending(true);
      setError('');
      const result = await sendEmailOtp(email);
      setResending(false);
      if (!result.ok) {
        setError(result.error);
        recoveryOtpSentRef.current = false;
        return;
      }
      setResendSeconds(RESEND_SECONDS);
    })();
  }, [email, isPinRecovery]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

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

  const handleVerify = useCallback(async () => {
    if (!isComplete || !email || verifyLockRef.current || loading) return;

    verifyLockRef.current = true;
    setLoading(true);
    setError('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await verifyEmailOtp(email, otp);
    if (!result.ok) {
      verifyLockRef.current = false;
      setLoading(false);
      setError(result.error);
      setOtp('');
      triggerShake();
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      clearMonitoringPinSession();
      await setLastProduct('monitoring');
      await signOutEsoPay();
      const session = await establishMonitoringSession(result.session);

      if (session) {
        const hasPinMeta = session.user.user_metadata?.hasPin === true;
        const hasLocalPin = await hasOperatorPin(session.user.id);

        if (hasLocalPin && !hasPinMeta) {
          await saveMonitoringHasPin();
        }

        const { data: refreshed } = await supabase.auth.getUser();
        const routeUser = refreshed.user ?? session.user;
        const nextRoute = await resolveMonitoringAuthRoute(routeUser);
        router.replace(nextRoute);
      }
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
  }, [email, isComplete, loading, otp, triggerShake]);

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

    setResendSeconds(RESEND_SECONDS);
    verifyLockRef.current = false;
    setOtp('');
  }, [canResend, email, resending]);

  const resendLabel = canResend
    ? 'Resend code'
    : `Resend in 0:${String(resendSeconds).padStart(2, '0')}`;

  const autoVerifyRef = useRef(false);
  useEffect(() => {
    if (otp.length !== OTP_LENGTH || loading || autoVerifyRef.current) return;
    autoVerifyRef.current = true;
    void handleVerify().finally(() => {
      autoVerifyRef.current = false;
    });
  }, [handleVerify, loading, otp.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.kav} behavior="padding" keyboardVerticalOffset={0}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <AuthPressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
              <Ionicons name="arrow-back" size={24} color={INVERTER_AUTH.TEAL} />
            </AuthPressable>
            <Text style={styles.stepCounter}>2 of 4</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.top}>
            <Text style={styles.h1}>
              {isPinRecovery ? 'Verify to reset your PIN.' : 'Check your email.'}
            </Text>
            <View style={styles.emailPill}>
              <Ionicons name="mail-outline" size={16} color={INVERTER_AUTH.TEAL} />
              <Text style={styles.emailText} numberOfLines={1}>
                {email}
              </Text>
            </View>
            <AuthPressable onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.wrongEmail}>Wrong email?</Text>
            </AuthPressable>
            <Text style={styles.subtext}>
              {isPinRecovery
                ? 'Enter the 6-digit code we emailed to confirm it\u2019s you.'
                : 'Enter the 6-digit code we sent. Check spam if it doesn\u2019t arrive.'}
            </Text>
            <OtpBoxes
              value={otp}
              length={OTP_LENGTH}
              onChange={(digits) => {
                if (digits.length < OTP_LENGTH) verifyLockRef.current = false;
                setOtp(digits);
                if (error) setError('');
              }}
              shakeStyle={shakeStyle}
              error={Boolean(error)}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.bottom}>
            <MonitoringTealButton
              label="Verify Code →"
              onPress={() => void handleVerify()}
              active={isComplete}
              disabled={!isComplete}
              loading={loading}
            />
            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Ionicons name="time-outline" size={14} color={INVERTER_AUTH.TEXT_SECONDARY} />
                <Text style={styles.footerExpiry}>Code expires in 10 minutes</Text>
              </View>
              <AuthPressable
                onPress={() => void handleResend()}
                disabled={!canResend || resending}
                accessibilityRole="button"
              >
                <Text style={[styles.resendText, canResend && styles.resendActive]}>
                  {resendLabel}
                </Text>
              </AuthPressable>
            </View>
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
  kav: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: INVERTER_AUTH.BG_PRIMARY,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCounter: {
    color: INVERTER_AUTH.TEAL,
    fontFamily: inter.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: INVERTER_AUTH.BORDER_DEFAULT,
  },
  progressActive: {
    backgroundColor: INVERTER_AUTH.TEAL,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
    minHeight: 0,
  },
  top: {
    gap: 10,
    paddingTop: 16,
  },
  bottom: {
    gap: 12,
    marginTop: 24,
  },
  h1: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.bold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: INVERTER_AUTH.BG_SURFACE,
    borderWidth: 1,
    borderColor: INVERTER_AUTH.BORDER_DEFAULT,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emailText: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.regular,
    fontSize: 14,
    flex: 1,
  },
  wrongEmail: {
    color: INVERTER_AUTH.TEAL,
    fontFamily: inter.regular,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  subtext: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: INVERTER_AUTH.ERROR,
    fontFamily: inter.regular,
    fontSize: 12,
  },
  footer: {
    gap: 8,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerExpiry: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 12,
    textAlign: 'center',
  },
  resendText: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  resendActive: {
    color: INVERTER_AUTH.TEAL,
    textDecorationLine: 'underline',
  },
});
