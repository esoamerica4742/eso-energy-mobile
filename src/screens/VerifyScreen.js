import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Clock } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AuthFlowLayout } from '@/components/auth/AuthFlowLayout';
import { AuthButton } from '../components/AuthButton';
import { AuthTopBar } from '../components/AuthTopBar';
import { OtpBox } from '../components/OtpBox';
import { MotionPressable, MotionView } from '@/lib/motion';
import {
  establishMonitoringSession,
  isEsoPayProfileComplete,
  isMonitoringProfileComplete,
} from '../lib/authProfile';
import { sendEmailOtp, sendEsoPayEmailOtp, verifyEmailOtp, verifyEsoPayEmailOtp } from '../lib/authOtp';
import {
  clearEsoPaySession,
  completeEsoPayEmailSignIn,
  establishEsoPaySession,
} from '@/esopay/auth/syncEsoPaySession';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { ESOPAY_HOME_ROUTE, MONITORING_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import { EsoPayVerifyEmailChip } from '@/esopay/auth/components/EsoPayVerifyEmailChip';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { C, F } from '../theme/authTheme';

const BOXES = 6;

function paramString(value) {
  if (Array.isArray(value)) return value[0] ?? '';
  return (value ?? '').toString();
}

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = paramString(params.email);
  const module = paramString(params.module) || 'inverter';
  const isEsoPay = module === 'esopay';
  const authVariant = isEsoPay ? 'esopay' : 'default';
  const isEsoPay = module === 'esopay';
  const authVariant = isEsoPay ? 'esopay' : 'default';
  const screenBg = isEsoPay ? ESOPAY_SIGN_IN.bg : C.DARK_1;
  const inputRef = useRef(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const shake = useSharedValue(0);
  const boxScale0 = useSharedValue(1);
  const boxScale1 = useSharedValue(1);
  const boxScale2 = useSharedValue(1);
  const boxScale3 = useSharedValue(1);
  const boxScale4 = useSharedValue(1);
  const boxScale5 = useSharedValue(1);
  const boxScales = useMemo(
    () => [boxScale0, boxScale1, boxScale2, boxScale3, boxScale4, boxScale5],
    [boxScale0, boxScale1, boxScale2, boxScale3, boxScale4, boxScale5],
  );

  useEffect(() => {
    setOtp('');
    setErrorMsg('');
    let cancelled = false;
    let focusTimer;
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [shake]);

  const flashSuccess = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    boxScales.forEach((s) => {
      s.value = withSequence(withSpring(1.05), withSpring(1));
    });
  }, [boxScales]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6 || !email) return;
    setIsLoading(true);
    setErrorMsg('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result =
      module === 'esopay'
        ? await verifyEsoPayEmailOtp(email, otp)
        : await verifyEmailOtp(email, otp);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMsg(result.error);
      triggerShake();
      setOtp('');
      return;
    }

    flashSuccess();
    await new Promise((r) => setTimeout(r, 400));

    if (module === 'esopay') {
      await setLastProduct('esopay');

      if (isEsoPayProfileComplete(result.user)) {
        try {
          await completeEsoPayEmailSignIn(result.session);
        } catch (syncErr) {
          setErrorMsg(
            syncErr instanceof Error ? syncErr.message : 'Could not start your Eso Pay session.',
          );
          triggerShake();
          setOtp('');
          return;
        }
        router.replace(ESOPAY_HOME_ROUTE);
        return;
      }

      try {
        await establishEsoPaySession(result.session);
      } catch (syncErr) {
        setErrorMsg(
          syncErr instanceof Error ? syncErr.message : 'Could not start your Eso Pay session.',
        );
        triggerShake();
        setOtp('');
        return;
      }

      router.push({ pathname: '/auth/register', params: { email, module } });
      return;
    }

    await setLastProduct('monitoring');
    clearEsoPaySession();

    try {
      await establishMonitoringSession(result.session);
    } catch (syncErr) {
      setErrorMsg(
        syncErr instanceof Error ? syncErr.message : 'Could not start your monitoring session.',
      );
      triggerShake();
      setOtp('');
      return;
    }

    if (isMonitoringProfileComplete(result.user)) {
      router.replace(MONITORING_HOME_ROUTE);
      return;
    }

    router.push({ pathname: '/auth/register', params: { email, module } });
  }, [otp, email, module, router, triggerShake, flashSuccess]);

  const onDigit = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    if (digits.length > otp.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setOtp(digits);
    setErrorMsg('');
  };

  const handleResend = async () => {
    if (!email || resending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResending(true);
    setErrorMsg('');

    const result =
      module === 'esopay' ? await sendEsoPayEmailOtp(email) : await sendEmailOtp(email);
    setResending(false);

    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }

    setSeconds(30);
    setOtp('');
  };

  const timerLabel =
    seconds > 0
      ? `Resend code in 0:${String(seconds).padStart(2, '0')}`
      : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]} edges={['top', 'left', 'right']}>
      <AuthFlowLayout
        backgroundColor={screenBg}
        keyboardPersistTaps="always"
        footer={
          <AuthButton
            variant={authVariant}
            label="Verify Code →"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length !== 6}
          />
        }
        footerStyle={styles.verifyFooter}
      >
        <AuthTopBar step={2} progressPercent={66} variant={authVariant} />

        <MotionView variant="fadeInDown" delay={0} style={{ marginTop: 48 }}>
          <Text style={[styles.headline, isEsoPay && styles.headlineEsoPay]}>
            Check your{'\n'}email.
          </Text>
          {isEsoPay ? (
            <EsoPayVerifyEmailChip email={email} />
          ) : (
            <View style={styles.emailRow}>
              <Feather name="mail" size={14} color={C.GOLD_MID} />
              <Text style={styles.email}>{email}</Text>
            </View>
          )}
          <MotionPressable haptic="light" onPress={() => router.back()}>
            <Text style={[styles.wrongEmail, isEsoPay && styles.wrongEmailEsoPay]}>
              Wrong email?
            </Text>
          </MotionPressable>
          <Text style={[styles.sub, isEsoPay && styles.subEsoPay]}>
            Enter the 6-digit code we sent.
          </Text>
          <Text style={[styles.hint, isEsoPay && styles.hintEsoPay]}>
            Please check your spam and promotions folders if the verification code does not arrive
            within a few seconds.
          </Text>
        </MotionView>

        <View style={styles.otpWrap}>
          <Animated.View style={[styles.otpRow, shakeStyle]} pointerEvents="none">
            {Array.from({ length: BOXES }).map((_, i) => (
              <OtpBox
                key={i}
                char={otp[i] || ''}
                focused={otp.length === i}
                filled={Boolean(otp[i])}
                error={Boolean(errorMsg)}
                scale={boxScales[i]}
                variant={authVariant}
              />
            ))}
          </Animated.View>
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={onDigit}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            showSoftInputOnFocus
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            textContentType="oneTimeCode"
            importantForAutofill="yes"
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.otpInputOverlay}
            caretHidden
            selectionColor="transparent"
          />
        </View>

        {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

        <View style={styles.trustRow}>
          {isEsoPay ? (
            <Clock size={14} color={ESOPAY_SIGN_IN.teal} weight="duotone" />
          ) : (
            <Feather name="clock" size={11} color={C.TEAL} />
          )}
          <Text style={[styles.trustGold, isEsoPay && styles.trustGoldEsoPay]}>
            Code expires in 10 minutes
          </Text>
        </View>

        <View style={styles.resend}>
          {timerLabel ? (
            <Text style={styles.timer}>{timerLabel}</Text>
          ) : (
            <MotionPressable onPress={handleResend} disabled={resending} haptic="light">
              <Text style={[styles.resendLink, isEsoPay && styles.resendLinkEsoPay]}>
                {resending ? 'Sending…' : "Didn't get it? Resend code"}
              </Text>
            </MotionPressable>
          )}
        </View>
      </AuthFlowLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  verifyFooter: { paddingTop: 28 },
  headline: { fontFamily: F.cormorant, fontSize: 44, lineHeight: 48, color: C.WHITE },
  headlineEsoPay: {
    fontFamily: inter.semibold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: ESOPAY_SIGN_IN.warmWhite,
  },
  subEsoPay: {
    fontFamily: inter.regular,
    color: ESOPAY_SIGN_IN.muted,
    opacity: 1,
  },
  hintEsoPay: {
    fontFamily: inter.regular,
    color: ESOPAY_SIGN_IN.legal,
    opacity: 1,
  },
  wrongEmailEsoPay: {
    fontFamily: inter.medium,
    color: ESOPAY_SIGN_IN.teal,
  },
  headlineEsoPay: {
    fontFamily: inter.semibold,
    fontSize: 40,
    lineHeight: 46,
    color: ESOPAY_SIGN_IN.warmWhite,
  },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  email: { marginLeft: 8, fontFamily: F.sansMed, fontSize: 14, color: C.WHITE },
  wrongEmail: {
    marginTop: 8,
    fontFamily: F.sansLight,
    fontSize: 13,
    color: C.TEAL,
    textDecorationLine: 'underline',
  },
  sub: {
    marginTop: 12,
    fontFamily: F.sansLight,
    fontSize: 15,
    color: C.OFF_WHITE,
    opacity: 0.5,
  },
  hint: {
    marginTop: 10,
    fontFamily: F.sansLight,
    fontSize: 12,
    lineHeight: 18,
    color: C.OFF_WHITE,
    opacity: 0.4,
  },
  otpWrap: { marginTop: 44, position: 'relative', minHeight: 58 },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  otpInputOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: 'transparent',
    fontSize: 24,
    letterSpacing: 18,
    paddingHorizontal: 4,
  },
  errorMsg: {
    marginTop: 12,
    fontFamily: F.sansLight,
    fontSize: 12,
    color: C.ERROR,
    textAlign: 'center',
  },
  trustRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center' },
  trustGold: {
    marginLeft: 6,
    fontFamily: F.sansLight,
    fontSize: 11,
    color: C.OFF_WHITE,
    opacity: 0.25,
  },
  trustGoldEsoPay: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: ESOPAY_SIGN_IN.muted,
    opacity: 1,
  },
  resend: { marginTop: 32, alignItems: 'center' },
  timer: { fontFamily: F.mono, fontSize: 12, color: C.OFF_WHITE, opacity: 0.35 },
  resendLink: { fontFamily: F.sansLight, fontSize: 13, color: C.TEAL },
  resendLinkEsoPay: {
    fontFamily: inter.medium,
    color: ESOPAY_SIGN_IN.teal,
  },
});
