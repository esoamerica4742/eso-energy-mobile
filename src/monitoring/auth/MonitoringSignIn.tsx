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
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Activity, ArrowLeft, Lock, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { sendEmailOtp } from '@/lib/authOtp';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { EMAIL_RE } from '@/theme/authTheme';
import { inter } from '@/theme/fonts';
import { MONITORING_AUTH } from '@/theme/monitoringAuthTheme';

const EMAIL_BORDER_REST = 'rgba(255,255,255,0.15)';
const PRESS_SPRING = { damping: 18, stiffness: 300 };

type Props = {
  module: string;
};

export default function MonitoringSignIn({ module }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setEmail: persistEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const isValidEmail = EMAIL_RE.test(email.trim());
  const sendCodeScale = useSharedValue(1);
  const sendCodeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendCodeScale.value }],
  }));

  const wasValid = useRef(false);
  useEffect(() => {
    if (isValidEmail && !wasValid.current) {
      void Haptics.selectionAsync();
    }
    wasValid.current = isValidEmail;
  }, [isValidEmail]);

  const handleSendCode = async () => {
    setTouched(true);
    if (!isValidEmail) {
      setError('Enter a valid work email');
      return;
    }
    setIsLoading(true);
    setError('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const result = await sendEmailOtp(email);
    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    persistEmail(normalizedEmail);
    void setLastProduct('monitoring');
    router.push({ pathname: '/auth/verify', params: { email: normalizedEmail, module } });
  };

  const handleSendCodePressIn = useCallback(() => {
    sendCodeScale.value = withSpring(0.97, PRESS_SPRING);
  }, [sendCodeScale]);

  const handleSendCodePressOut = useCallback(() => {
    sendCodeScale.value = withSpring(1.0, PRESS_SPRING);
  }, [sendCodeScale]);

  const showEmailError =
    touched && !isValidEmail && email.length > 0 ? error || 'Enter a valid work email' : error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={MONITORING_AUTH.bg} />

      <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.headerRow, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft color={MONITORING_AUTH.teal} size={22} />
          </TouchableOpacity>
          <Text style={styles.stepText}>1 of 3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={styles.progressFilled} />
          <View style={styles.progressUnfilled} />
          <View style={styles.progressUnfilled} />
        </View>

        <View style={styles.brandBadge}>
          <Activity color={MONITORING_AUTH.teal} size={22} />
        </View>

        <View style={styles.moduleBadge}>
          <Text style={styles.moduleBadgeText}>⚡ Eso Inverter Monitoring</Text>
        </View>

        <Text style={styles.headline}>Sign in with your work email.</Text>

        <Text style={styles.subtext}>
          We&apos;ll email you a 6-digit code.{'\n'}New here? We&apos;ll create your account.
        </Text>

        <Text style={styles.emailLabel}>Work Email</Text>

        <TextInput
          style={[
            styles.emailInput,
            {
              borderColor: emailFocused ? MONITORING_AUTH.teal : EMAIL_BORDER_REST,
            },
          ]}
          placeholder="you@company.com"
          placeholderTextColor="rgba(255,255,255,0.35)"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="off"
          importantForAutofill="no"
          textContentType="none"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError('');
          }}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => {
            setEmailFocused(false);
            setTouched(true);
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (!isValidEmail && email.length > 0) {
              setError('Enter a valid work email');
            }
          }}
          underlineColorAndroid="transparent"
        />

        {showEmailError ? <Text style={styles.errorText}>{showEmailError}</Text> : null}

        <TouchableOpacity
          onPress={() => void handleSendCode()}
          onPressIn={handleSendCodePressIn}
          onPressOut={handleSendCodePressOut}
          disabled={isLoading || !isValidEmail}
          accessibilityRole="button"
          accessibilityLabel="Send Code"
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.sendCodeButton,
              (isLoading || !isValidEmail) && styles.sendCodeButtonDisabled,
              sendCodeAnimStyle,
            ]}
          >
            <Text style={styles.sendCodeText}>Send Code →</Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.securityCard}>
          <View style={styles.securityRow}>
            <Lock color={MONITORING_AUTH.teal} size={16} />
            <Text style={styles.securityText}>
              Encrypted sign-in and inverter data on this device.
            </Text>
          </View>
          <View style={styles.securityRow}>
            <ShieldCheck color={MONITORING_AUTH.teal} size={16} />
            <Text style={styles.securityText}>
              Device PIN required before accessing monitoring.
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MONITORING_AUTH.bg,
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
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: inter.regular,
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
    backgroundColor: MONITORING_AUTH.teal,
  },
  progressUnfilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: MONITORING_AUTH.teal,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moduleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: MONITORING_AUTH.teal,
    backgroundColor: MONITORING_AUTH.pillBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  moduleBadgeText: {
    color: MONITORING_AUTH.teal,
    fontSize: 12,
    fontFamily: inter.semibold,
    letterSpacing: 0.5,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: inter.bold,
    lineHeight: 38,
    marginBottom: 12,
  },
  subtext: {
    color: MONITORING_AUTH.subtext,
    fontSize: 15,
    fontFamily: inter.regular,
    lineHeight: 22,
    marginBottom: 24,
  },
  emailLabel: {
    color: MONITORING_AUTH.subtext,
    fontSize: 13,
    fontFamily: inter.medium,
    marginBottom: 8,
  },
  emailInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: MONITORING_AUTH.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontFamily: inter.regular,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: '#FF4444',
    marginBottom: 8,
  },
  sendCodeButton: {
    backgroundColor: MONITORING_AUTH.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendCodeButtonDisabled: {
    opacity: 0.6,
  },
  sendCodeText: {
    color: MONITORING_AUTH.buttonText,
    fontSize: 16,
    fontFamily: inter.bold,
  },
  securityCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  securityText: {
    flex: 1,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: inter.regular,
    lineHeight: 18,
  },
});
