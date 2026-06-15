import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AuthFlowLayout } from '@/components/auth/AuthFlowLayout';
import { AuthLegalFooter } from '@/components/auth/AuthLegalFooter';
import { AuthButton } from '../components/AuthButton';
import { AuthInput } from '../components/AuthInput';
import { AuthTopBar } from '../components/AuthTopBar';
import { MotionView } from '@/lib/motion';
import { useAuth } from '../hooks/useAuth';
import { sendEmailOtp, sendEsoPayEmailOtp } from '../lib/authOtp';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { EsoPaySignInHero } from '@/esopay/auth/components/EsoPaySignInHero';
import { EsoPayTrustStrip } from '@/esopay/auth/components/EsoPayTrustStrip';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { C, EMAIL_RE, F, modulePillConfig } from '../theme/authTheme';

function paramString(value) {
  if (Array.isArray(value)) return value[0] ?? '';
  return (value ?? '').toString();
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const module = paramString(params.module) || 'inverter';
  const { setEmail: persistEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const isValidEmail = EMAIL_RE.test(email.trim());
  const isEsoPay = module === 'esopay';
  const pill = modulePillConfig(module);
  const authVariant = isEsoPay ? 'esopay' : 'default';
  const screenBg = isEsoPay ? ESOPAY_SIGN_IN.bg : C.DARK_1;

  const wasValid = useRef(false);
  useEffect(() => {
    if (isValidEmail && !wasValid.current) {
      Haptics.selectionAsync();
    }
    wasValid.current = isValidEmail;
  }, [isValidEmail]);

  const handleSendCode = async () => {
    setTouched(true);
    if (!isValidEmail) {
      setError(isEsoPay ? 'Enter a valid email address' : 'Enter a valid work email');
      return;
    }
    setIsLoading(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const result = isEsoPay ? await sendEsoPayEmailOtp(email) : await sendEmailOtp(email);
    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    persistEmail(email.trim());
    void setLastProduct(isEsoPay ? 'esopay' : 'monitoring');
    router.push({ pathname: '/auth/verify', params: { email: email.trim(), module } });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]} edges={['top', 'left', 'right']}>
      <AuthFlowLayout
        backgroundColor={screenBg}
        footer={
          <>
            <AuthButton
              variant={authVariant}
              goldCta={isEsoPay}
              label="Send Code →"
              onPress={handleSendCode}
              loading={isLoading}
              disabled={!isValidEmail}
            />
            <AuthLegalFooter
              bottomInset={insets.bottom}
              variant={authVariant}
              embedded
            />
          </>
        }

      >
        <AuthTopBar step={1} progressPercent={33} variant={authVariant} />

        <MotionView variant="fadeInDown" delay={100} style={{ marginTop: isEsoPay ? 40 : 48 }}>
          {isEsoPay ? (
            <EsoPaySignInHero />
          ) : (
            <View style={styles.brand}>
              <View style={styles.icon}>
                <Text style={styles.iconLetter}>E</Text>
              </View>
              <Text style={styles.brandText}>ESO ENERGY</Text>
            </View>
          )}
          <Text style={[styles.headline, isEsoPay && styles.headlineEsoPay]}>
            {isEsoPay ? 'Sign in with\nyour email.' : 'Enter your\nwork email.'}
          </Text>
        </MotionView>

        <MotionView variant="fadeInDown" delay={200}>
          <Text style={[styles.sub, isEsoPay && styles.subEsoPay]}>
            {isEsoPay
              ? "We'll email you a 6-digit code.\nNew here? We'll create your account."
              : "We'll send a verification code.\nNo password needed."}
          </Text>
        </MotionView>

        {!isEsoPay ? (
          <MotionView
            variant="fadeIn"
            delay={300}
            style={[styles.pill, { borderColor: pill.borderColor, backgroundColor: pill.bg }]}
          >
            <Text style={[styles.pillText, { color: pill.textColor, fontFamily: F.cormorant }]}>
              {pill.label}
            </Text>
          </MotionView>
        ) : null}

        <View style={{ marginTop: isEsoPay ? 32 : 40 }}>
          <AuthInput
            variant={authVariant}
            label={isEsoPay ? 'Email' : 'Work Email'}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) setError('');
            }}
            placeholder={isEsoPay ? 'you@email.com' : 'you@company.com'}
            keyboardType="email-address"
            autoFocus
            autoCapitalize="none"
            error={
              touched && !isValidEmail && email.length > 0
                ? error || (isEsoPay ? 'Enter a valid email address' : 'Enter a valid work email')
                : error
            }
            onBlur={() => {
              setTouched(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (!isValidEmail && email.length > 0) {
                setError(isEsoPay ? 'Enter a valid email address' : 'Enter a valid work email');
              }
            }}
          />
        </View>

        {isEsoPay ? (
          <EsoPayTrustStrip />
        ) : (
          <>
            <View style={styles.trustRow}>
              <Feather name="lock" size={11} color="rgba(232,232,224,0.3)" />
              <Text style={styles.trustSmall}>Your data is encrypted end-to-end.</Text>
            </View>
            <View style={styles.trustRow2}>
              <Feather name="shield" size={11} color={C.GOLD_MID} />
              <Text style={styles.trustGold}>256-bit encrypted · SOC 2 compliant</Text>
            </View>
          </>
        )}
      </AuthFlowLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: { fontFamily: F.cormorant, fontSize: 14, color: C.DARK_1 },
  brandText: { marginLeft: 10, fontFamily: F.sansMed, fontSize: 13, color: C.WHITE },
  headline: { fontFamily: F.cormorant, fontSize: 44, lineHeight: 48, color: C.WHITE },
  headlineEsoPay: {
    fontFamily: inter.semibold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: ESOPAY_SIGN_IN.warmWhite,
  },
  sub: {
    marginTop: 12,
    fontFamily: F.sansLight,
    fontSize: 15,
    lineHeight: 24,
    color: C.OFF_WHITE,
    opacity: 0.5,
  },
  subEsoPay: {
    fontFamily: inter.regular,
    color: ESOPAY_SIGN_IN.muted,
    opacity: 1,
  },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: { fontSize: 15 },
  trustRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  trustRow2: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  trustSmall: {
    marginLeft: 6,
    fontFamily: F.sansLight,
    fontSize: 12,
    color: C.OFF_WHITE,
    opacity: 0.3,
  },
  trustGold: {
    marginLeft: 6,
    fontFamily: F.sansLight,
    fontSize: 11,
    color: C.OFF_WHITE,
    opacity: 0.25,
  },
});
