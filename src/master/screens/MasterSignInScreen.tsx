import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { sendEmailOtp } from '@/lib/authOtp';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { MasterOtpOverlay } from '@/master/components/MasterOtpOverlay';
import { getDefaultLaunchPreference } from '@/master/launchPreference';
import { routeForLaunchPreference } from '@/master/resolveMasterBootRoute';
import { ACCESS_ROUTE } from '@/lib/navigation/productRoutes';

export default function MasterSignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await sendEmailOtp(email.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOtpOpen(true);
  }, [email]);

  const afterVerify = useCallback(async () => {
    await setOnboardingComplete();
    setOtpOpen(false);

    const preference = await getDefaultLaunchPreference();
    const route = preference ? routeForLaunchPreference(preference) : ACCESS_ROUTE;
    router.replace(route);
  }, [router]);

  return (
    <View className="flex-1 bg-[#080A0F]" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} className="mb-6 mt-2 flex-row items-center gap-2">
            <ArrowLeft size={20} color="#8A94A6" />
            <Text className="text-sm text-[#8A94A6]">Back</Text>
          </Pressable>

          <Text className="mb-2 text-3xl font-bold text-white">Sign in</Text>
          <Text className="mb-8 text-sm leading-5 text-[#8A94A6]">
            We&apos;ll email you a secure verification code. No password needed.
          </Text>

          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8A94A6]">
            Email address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@company.com"
            placeholderTextColor="#4A5568"
            className="mb-4 rounded-xl border border-[#1C2030] bg-[#0D1018] px-4 py-3.5 text-base text-white"
          />

          {error ? <Text className="mb-4 text-sm text-red-400">{error}</Text> : null}

          <Pressable
            onPress={() => void submit()}
            disabled={busy}
            className="items-center rounded-xl bg-[#C9A84C] py-4"
          >
            <Text className="text-base font-bold text-[#080A0F]">
              {busy ? 'Sending code…' : 'Send verification code'}
            </Text>
          </Pressable>

          <Text className="mt-6 text-center text-xs text-[#4A5568]">
            Bank-grade encryption · Secure Access
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <MasterOtpOverlay
        visible={otpOpen}
        email={email.trim()}
        onClose={() => setOtpOpen(false)}
        onVerified={() => void afterVerify()}
      />
    </View>
  );
}
