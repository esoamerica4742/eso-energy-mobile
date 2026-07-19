import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { triggerHaptic } from '@/lib/haptics';
import { sendEmailOtp } from '@/lib/authOtp';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { MasterOtpOverlay } from '@/master/components/MasterOtpOverlay';
import {
  AUTH,
  MasterAuthActions,
  MasterAuthShell,
  authType,
} from '@/master/components/MasterAuthChrome';
import { getDefaultLaunchPreference } from '@/master/launchPreference';
import { routeForLaunchPreference } from '@/master/resolveMasterBootRoute';
import {
  ACCESS_ROUTE,
  MASTER_PIN_SETUP_ROUTE,
  MASTER_REGISTER_ROUTE,
} from '@/lib/navigation/productRoutes';
import { hasMasterPin } from '@/master/masterPin';
import { useEsoPayAuthStore } from '@/esopay/auth/store';

export default function MasterSignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canContinue = isEmailValid && !busy;

  const submit = useCallback(async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email');
      return;
    }
    triggerHaptic();
    setBusy(true);
    setError(null);
    const result = await sendEmailOtp(email.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOtpOpen(true);
  }, [email]);

  const afterVerify = useCallback(async () => {
    await setOnboardingComplete();
    setOtpOpen(false);

    const userId = useEsoPayAuthStore.getState().user?.id;
    if (userId && !(await hasMasterPin(userId))) {
      router.replace(MASTER_PIN_SETUP_ROUTE);
      return;
    }

    const preference = await getDefaultLaunchPreference();
    const route = preference ? routeForLaunchPreference(preference) : ACCESS_ROUTE;
    router.replace(route);
  }, [router]);

  return (
    <>
      <MasterAuthShell>
        <Text style={authType.title}>Log in to Eso Energy</Text>
        <Text style={authType.subtitle}>
          Enter your email. We will send you a confirmation code there.
        </Text>

        <View style={authType.fieldStack}>
          <View style={[authType.pill, focused && authType.pillFocused]}>
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (error) setError(null);
              }}
              placeholder="Enter your email"
              placeholderTextColor={AUTH.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
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
          linkLabel="New to Eso Energy? Create an account"
          onLinkPress={() => router.push(MASTER_REGISTER_ROUTE)}
          continueDisabled={!canContinue}
          continueBusy={busy}
          onContinue={() => void submit()}
        />
      </MasterAuthShell>

      <MasterOtpOverlay
        visible={otpOpen}
        email={email.trim()}
        onClose={() => setOtpOpen(false)}
        onVerified={() => void afterVerify()}
      />
    </>
  );
}
