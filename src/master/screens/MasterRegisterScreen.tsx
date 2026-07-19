import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { sendEmailOtp } from '@/lib/authOtp';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { MASTER_PIN_SETUP_ROUTE, MASTER_SIGN_IN_ROUTE } from '@/lib/navigation/productRoutes';
import { MasterOtpOverlay } from '@/master/components/MasterOtpOverlay';
import {
  AUTH,
  MasterAuthActions,
  MasterAuthShell,
  authType,
} from '@/master/components/MasterAuthChrome';
import { MASTER_COUNTRIES, type MasterCountry } from '@/master/constants';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { inter } from '@/theme/fonts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function phoneDigitsOf(local: string): string {
  return local.replace(/\D/g, '').replace(/^0/, '');
}

function isValidPhone(local: string): boolean {
  const digits = phoneDigitsOf(local);
  return digits.length >= 9 && digits.length <= 11;
}

export default function MasterRegisterScreen() {
  const router = useRouter();

  const [country, setCountry] = useState<MasterCountry>(MASTER_COUNTRIES[0]!);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const phoneDigits = phoneDigitsOf(phoneLocal);
  const phoneE164 = `${country.dialCode}${phoneDigits}`;
  const canContinue =
    fullName.trim().length > 1 &&
    isValidPhone(phoneLocal) &&
    EMAIL_RE.test(email.trim()) &&
    !busy;

  const cycleCountry = useCallback(() => {
    const idx = MASTER_COUNTRIES.findIndex((c) => c.code === country.code);
    const next = MASTER_COUNTRIES[(idx + 1) % MASTER_COUNTRIES.length]!;
    setCountry(next);
    void Haptics.selectionAsync();
  }, [country.code]);

  const submit = useCallback(async () => {
    if (fullName.trim().length < 2) {
      setError('Enter your full name');
      return;
    }
    if (!isValidPhone(phoneLocal)) {
      setError('Enter a valid phone number');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email');
      return;
    }

    setBusy(true);
    setError(null);
    const send = await sendEmailOtp(email.trim());
    setBusy(false);
    if (!send.ok) {
      setError(send.error);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOtpOpen(true);
  }, [email, fullName, phoneLocal]);

  const finalizeRegistration = useCallback(async () => {
    const userId = useEsoPayAuthStore.getState().user?.id;
    if (!userId) {
      setError('Session missing after verification. Try again.');
      return;
    }

    setBusy(true);
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phoneE164,
          country_code: country.code,
        },
      });

      await setOnboardingComplete();
      setOtpOpen(false);
      router.replace(MASTER_PIN_SETUP_ROUTE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not finish registration.');
    } finally {
      setBusy(false);
    }
  }, [country.code, fullName, phoneE164, router]);

  return (
    <>
      <MasterAuthShell>
        <Text style={authType.title}>Create your Eso Energy account</Text>
        <Text style={authType.subtitle}>
          Enter your details. We will send a confirmation code to your email.
        </Text>

        <View style={authType.fieldStack}>
          <View style={[authType.pill, nameFocused && authType.pillFocused]}>
            <TextInput
              value={fullName}
              onChangeText={(v) => {
                setFullName(v);
                if (error) setError(null);
              }}
              placeholder="Full name"
              placeholderTextColor={AUTH.placeholder}
              autoCapitalize="words"
              autoComplete="name"
              autoFocus
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              style={authType.input}
              returnKeyType="next"
              accessibilityLabel="Full name"
            />
          </View>

          <View style={styles.phoneRow}>
            <Pressable
              onPress={cycleCountry}
              style={({ pressed }) => [styles.countryPill, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`Country ${country.name}`}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={styles.dial}>{country.dialCode}</Text>
            </Pressable>

            <View style={[styles.phonePill, phoneFocused && authType.pillFocused]}>
              <TextInput
                value={phoneLocal}
                onChangeText={(v) => {
                  setPhoneLocal(v.replace(/[^\d]/g, '').slice(0, 11));
                  if (error) setError(null);
                }}
                placeholder="Phone number"
                placeholderTextColor={AUTH.placeholder}
                keyboardType="phone-pad"
                autoComplete="tel"
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                style={authType.input}
                accessibilityLabel="Phone number"
              />
            </View>
          </View>

          <View style={[authType.pill, emailFocused && authType.pillFocused]}>
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (error) setError(null);
              }}
              placeholder="Email"
              placeholderTextColor={AUTH.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={authType.input}
              returnKeyType="go"
              onSubmitEditing={() => {
                if (canContinue) void submit();
              }}
              accessibilityLabel="Email address"
            />
          </View>
        </View>

        {error ? <Text style={authType.error}>{error}</Text> : null}

        <MasterAuthActions
          linkLabel="Already have an Eso Energy account?"
          onLinkPress={() => router.push(MASTER_SIGN_IN_ROUTE)}
          continueDisabled={!canContinue}
          continueBusy={busy}
          onContinue={() => void submit()}
        />
      </MasterAuthShell>

      <MasterOtpOverlay
        visible={otpOpen}
        email={email.trim()}
        onClose={() => setOtpOpen(false)}
        onVerified={() => void finalizeRegistration()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AUTH.surface,
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 56,
  },
  flag: {
    fontSize: 20,
    lineHeight: 24,
  },
  dial: {
    fontFamily: inter.medium,
    fontSize: 16,
    color: AUTH.text,
  },
  phonePill: {
    flex: 1,
    backgroundColor: AUTH.surface,
    borderRadius: 22,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.75,
  },
});
