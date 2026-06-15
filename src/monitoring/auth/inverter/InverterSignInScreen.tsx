import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { sendEmailOtp } from '@/lib/authOtp';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { inter } from '@/theme/fonts';
import { EMAIL_RE } from '@/theme/authTheme';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import { MonitoringTealButton } from '@/monitoring/auth/inverter/MonitoringAuthChrome';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

export default function InverterSignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setEmail: persistEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = EMAIL_RE.test(email.trim());
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withTiming(focused ? 1 : 0, { duration: 200, easing: Easing.ease });
  }, [focused, focusProgress]);

  const inputBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [INVERTER_AUTH.BORDER_DEFAULT, INVERTER_AUTH.TEAL],
    ),
  }));

  const handleSendCode = async () => {
    if (!isValid || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError('');

    const result = await sendEmailOtp(email);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const normalized = email.trim().toLowerCase();
    persistEmail(normalized);
    void setLastProduct('monitoring');
    router.push({ pathname: '/inverter/otp', params: { email: normalized } });
  };

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.kav} behavior="padding" keyboardVerticalOffset={0}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <AuthPressable onPress={handleBack} hitSlop={12} accessibilityRole="button">
              <Ionicons name="arrow-back" size={24} color={INVERTER_AUTH.TEAL} />
            </AuthPressable>
            <Text style={styles.stepCounter}>1 of 4</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.top}>
            <View style={styles.iconWrapper}>
              <Ionicons name="pulse" size={32} color={INVERTER_AUTH.TEAL} />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⚡ Eso Inverter Monitoring</Text>
            </View>
            <Text style={styles.h1}>Sign in with your email.</Text>
            <Text style={styles.subtext}>
              We&apos;ll send a 6-digit code. New here? We&apos;ll set up your account.
            </Text>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <Animated.View style={[styles.inputWrap, inputBorderStyle]}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError('');
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@example.com"
                placeholderTextColor={INVERTER_AUTH.TEXT_SECONDARY}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                cursorColor={INVERTER_AUTH.TEAL}
                selectionColor={INVERTER_AUTH.TEAL}
              />
            </Animated.View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={[styles.bottom, { marginBottom: insets.bottom }]}>
            <MonitoringTealButton
              label="Send Code →"
              onPress={() => void handleSendCode()}
              active={isValid}
              disabled={!isValid}
              loading={loading}
            />
            <View style={styles.securityCard}>
              <View style={styles.securityRow}>
                <Ionicons name="lock-closed" size={16} color={INVERTER_AUTH.TEAL} />
                <Text style={styles.securityText}>
                  Encrypted sign-in and inverter data on this device.
                </Text>
              </View>
              <View style={styles.securityRow}>
                <Ionicons name="shield-checkmark" size={16} color={INVERTER_AUTH.TEAL} />
                <Text style={styles.securityText}>
                  Device PIN required before accessing monitoring.
                </Text>
              </View>
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
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: INVERTER_AUTH.TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: INVERTER_AUTH.TEAL,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: INVERTER_AUTH.TEAL,
    fontFamily: inter.semibold,
    fontSize: 13,
    fontWeight: '600',
  },
  h1: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.bold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtext: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.semibold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  inputWrap: {
    height: 56,
    borderRadius: INVERTER_AUTH.INPUT_RADIUS,
    borderWidth: 1.5,
    backgroundColor: INVERTER_AUTH.BG_SURFACE,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.regular,
    fontSize: 16,
  },
  error: {
    color: INVERTER_AUTH.ERROR,
    fontFamily: inter.regular,
    fontSize: 12,
  },
  bottom: {
    gap: 12,
    marginTop: 24,
  },
  securityCard: {
    backgroundColor: INVERTER_AUTH.BG_SURFACE,
    borderRadius: INVERTER_AUTH.INPUT_RADIUS,
    borderWidth: 1,
    borderColor: INVERTER_AUTH.BORDER_DEFAULT,
    padding: 16,
    gap: 10,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  securityText: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
