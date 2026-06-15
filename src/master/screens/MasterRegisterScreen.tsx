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
import { supabase } from '@/lib/supabase';
import { sendEmailOtp } from '@/lib/authOtp';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { ACCESS_ROUTE } from '@/lib/navigation/productRoutes';
import {
  CountryPickerModal,
  CountrySelectField,
} from '@/master/components/CountryPickerModal';
import { MasterOtpOverlay } from '@/master/components/MasterOtpOverlay';
import { MASTER_COUNTRIES, MASTER_PIN_LENGTH } from '@/master/constants';
import { setMasterPin } from '@/master/masterPin';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { useMasterSessionStore } from '@/master/masterSessionStore';
import { useEsoPayAuthStore } from '@/esopay/auth/store';

function isValidPhone(dialCode: string, local: string): boolean {
  const digits = local.replace(/\D/g, '');
  if (dialCode === '+234') return digits.length >= 10 && digits.length <= 11;
  if (dialCode === '+233') return digits.length >= 9 && digits.length <= 10;
  if (dialCode === '+254') return digits.length >= 9 && digits.length <= 10;
  if (dialCode === '+27') return digits.length >= 9 && digits.length <= 10;
  return digits.length >= 8;
}

export default function MasterRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const api = useEsoPayApiClient();
  const apiEnabled = useEsoPayEnabled();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(MASTER_COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const phoneE164 = `${country.dialCode}${phoneLocal.replace(/\D/g, '')}`;

  const validate = useCallback(() => {
    if (!fullName.trim()) return 'Enter your full name or company name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
    if (!isValidPhone(country.dialCode, phoneLocal)) return 'Enter a valid phone number.';
    if (pin.length !== MASTER_PIN_LENGTH) return `Create a ${MASTER_PIN_LENGTH}-digit PIN.`;
    if (pin !== confirmPin) return 'PINs do not match.';
    return null;
  }, [confirmPin, country.dialCode, email, fullName, phoneLocal, pin]);

  const submit = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
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
  }, [email, validate]);

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
          company_name: fullName.trim(),
        },
      });

      await setMasterPin(userId, pin);
      if (apiEnabled) {
        try {
          await api.security.setTransactionPin({ pin });
        } catch {
          // Local PIN still works offline.
        }
      }

      useMasterSessionStore.getState().setPinUnlocked(true);
      useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
      await setOnboardingComplete();
      router.replace(ACCESS_ROUTE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not finish registration.');
    } finally {
      setBusy(false);
      setOtpOpen(false);
    }
  }, [api, apiEnabled, country.code, fullName, phoneE164, pin, router]);

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

          <Text className="mb-2 text-3xl font-bold text-white">Create account</Text>
          <Text className="mb-8 text-sm leading-5 text-[#8A94A6]">
            One secure Eso Energy account for monitoring and Eso Pay.
          </Text>

          <Field label="Full name / Company name" value={fullName} onChangeText={setFullName} />
          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CountrySelectField
            label="Country"
            selected={country}
            onPress={() => setCountryOpen(true)}
          />

          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8A94A6]">
              Phone number
            </Text>
            <View className="flex-row items-center rounded-xl border border-[#1C2030] bg-[#0D1018]">
              <Text className="border-r border-[#1C2030] px-4 py-3.5 text-base text-[#C9A84C]">
                {country.dialCode}
              </Text>
              <TextInput
                value={phoneLocal}
                onChangeText={(v) => setPhoneLocal(v.replace(/[^\d]/g, ''))}
                keyboardType="phone-pad"
                placeholder="8012345678"
                placeholderTextColor="#4A5568"
                className="flex-1 px-4 py-3.5 text-base text-white"
              />
            </View>
          </View>

          <Field
            label="Create 4-digit PIN"
            value={pin}
            onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, MASTER_PIN_LENGTH))}
            secureTextEntry
            keyboardType="number-pad"
          />
          <Field
            label="Confirm 4-digit PIN"
            value={confirmPin}
            onChangeText={(v) => setConfirmPin(v.replace(/\D/g, '').slice(0, MASTER_PIN_LENGTH))}
            secureTextEntry
            keyboardType="number-pad"
          />

          {error ? <Text className="mb-4 text-sm text-red-400">{error}</Text> : null}

          <Pressable
            onPress={() => void submit()}
            disabled={busy}
            className="mt-2 items-center rounded-xl bg-[#C9A84C] py-4"
          >
            <Text className="text-base font-bold text-[#080A0F]">
              {busy ? 'Sending code…' : 'Continue'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={countryOpen}
        selected={country}
        onSelect={setCountry}
        onClose={() => setCountryOpen(false)}
      />

      <MasterOtpOverlay
        visible={otpOpen}
        email={email.trim()}
        onClose={() => setOtpOpen(false)}
        onVerified={() => void finalizeRegistration()}
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8A94A6]">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#4A5568"
        className="rounded-xl border border-[#1C2030] bg-[#0D1018] px-4 py-3.5 text-base text-white"
      />
    </View>
  );
}
