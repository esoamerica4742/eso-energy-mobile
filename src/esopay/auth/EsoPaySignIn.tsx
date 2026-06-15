import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, ShieldCheck, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { sendEsoPayEmailOtp } from '@/lib/authOtp';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import {
  EsoPayOnboardingProgressBar,
  EsoPayOnboardingStepLabel,
} from '@/esopay/auth/EsoPayOnboardingProgress';
import { SIGN_IN_EMAIL_INPUT } from '@/esopay/auth/esoPaySignInTheme';
import { ds } from '@/esopay/theme/designSystem';
import { EMAIL_RE } from '@/theme/authTheme';
import { inter } from '@/theme/fonts';
import { GOLD } from '@/theme/colors';

const EMAIL_BORDER_IDLE = '#2C2410';
const EMAIL_BORDER_FOCUS = '#C9A84C';
const EMAIL_INPUT_BG = '#0D0F18';

export default function EsoPaySignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setEmail: persistEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isValid = EMAIL_RE.test(email.trim());

  const handleSendCode = async () => {
    if (email.length === 0) return;

    setIsLoading(true);
    const result = await sendEsoPayEmailOtp(email);
    setIsLoading(false);

    if (!result.ok) return;

    persistEmail(email.trim());
    void setLastProduct('esopay');
    router.push({ pathname: '/auth/verify', params: { email: email.trim(), module: 'esopay' } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={ds.color.bg} />

      <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.headerRow, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft color={GOLD} size={22} />
          </TouchableOpacity>
          <Text style={styles.stepText}>1 of 3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={styles.progressFilled} />
          <View style={styles.progressUnfilled} />
          <View style={styles.progressUnfilled} />
        </View>

        <View style={styles.brandBadge}>
          <Wallet color={GOLD} size={22} />
        </View>

        <Text style={styles.esoPayLabel}>ESO PAY</Text>

        <Text style={styles.headline}>Sign in with your email.</Text>

        <Text style={styles.subtext}>
          We&apos;ll email you a 6-digit code.{'\n'}New here? We&apos;ll create your account.
        </Text>

        <Text style={styles.emailLabel}>Email</Text>

        <TextInput
          style={[
            styles.emailInput,
            {
              borderColor: emailFocused
                ? SIGN_IN_EMAIL_INPUT.borderFocus
                : SIGN_IN_EMAIL_INPUT.borderRest,
            },
          ]}
          placeholder="you@email.com"
          placeholderTextColor={SIGN_IN_EMAIL_INPUT.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="off"
          importantForAutofill="no"
          textContentType="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError('');
          }}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          underlineColorAndroid="transparent"
        />

        <TouchableOpacity
          style={[styles.sendCodeButton, isLoading && styles.sendCodeButtonDisabled]}
          onPress={() => void handleSendCode()}
          disabled={isLoading || !isValid}
          accessibilityRole="button"
          accessibilityLabel="Send Code"
        >
          <Text style={styles.sendCodeText}>Send Code →</Text>
        </TouchableOpacity>

        <View style={styles.securityCard}>
          <View style={styles.securityRow}>
            <Lock color={GOLD} size={16} />
            <Text style={styles.securityText}>Encrypted sign-in and wallet data on this device.</Text>
          </View>
          <View style={styles.securityRow}>
            <ShieldCheck color={GOLD} size={16} />
            <Text style={styles.securityText}>Transaction PIN required before every payment.</Text>
          </View>
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
    color: 'rgba(255,255,255,0.5)',
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
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  esoPayLabel: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 16,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 12,
  },
  subtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  emailLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 8,
  },
  emailInput: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: EMAIL_INPUT_BG,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: SIGN_IN_EMAIL_INPUT.text,
    fontFamily: inter.regular,
    fontSize: 16,
    marginBottom: 8,
  },
  sendCodeButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendCodeButtonDisabled: {
    opacity: 0.6,
  },
  sendCodeText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
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
    lineHeight: 18,
  },
});

