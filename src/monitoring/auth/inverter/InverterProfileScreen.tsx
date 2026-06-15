import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentUser,
  isMonitoringProfileComplete,
  saveUserProfile,
} from '@/lib/authProfile';
import { paramString } from '@/lib/authRouteParams';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { supabase } from '@/lib/supabase';
import { inter } from '@/theme/fonts';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import { resolveMonitoringAuthRoute } from '@/monitoring/auth/inverter/monitoringAuthRoute';
import { CountryPickerModal } from '@/monitoring/auth/inverter/CountryPickerModal';
import {
  INVERTER_COUNTRIES,
  type InverterCountry,
} from '@/monitoring/auth/inverter/countries';
import {
  MonitoringAuthHeader,
  MonitoringProgressBar,
  MonitoringScreenShell,
  MonitoringTealButton,
} from '@/monitoring/auth/inverter/MonitoringAuthChrome';
import { ProfileTextField } from '@/monitoring/auth/inverter/ProfileTextField';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

const NAME_MIN_LENGTH = 2;

export default function InverterProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const email = paramString(params.email);
  const module = paramString(params.module) || 'inverter';
  const { setProfile } = useAuth();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState<InverterCountry>(INVERTER_COUNTRIES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; form?: string }>({});

  const canSubmit = name.trim().length >= NAME_MIN_LENGTH;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await getCurrentUser();
      if (cancelled || !user) return;
      if (isMonitoringProfileComplete(user)) {
        const nextRoute = await resolveMonitoringAuthRoute(user);
        if (cancelled) return;
        if (nextRoute !== '/inverter/profile') {
          router.replace(nextRoute);
        }
        return;
      }
      const meta = user.user_metadata ?? {};
      if (meta.full_name?.trim()) setName(meta.full_name.trim());
      if (meta.company?.trim()) setCompany(meta.company.trim());
      if (meta.job_title?.trim()) setTitle(meta.job_title.trim());
    })();
    return () => {
      cancelled = true;
    };
  }, [email, router]);

  const handleRegister = useCallback(async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < NAME_MIN_LENGTH) {
      setErrors({ name: 'Enter your full name' });
      return;
    }

    setLoading(true);
    setErrors({});
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setProfile({
      name: trimmedName,
      company: company.trim(),
      title: title.trim(),
      country,
    });

    const saved = await saveUserProfile({
      name: trimmedName,
      company: company.trim(),
      title: title.trim(),
      country,
      module,
    });

    setLoading(false);

    if (!saved.ok) {
      setErrors({ form: saved.error || 'Could not save your profile. Try again.' });
      return;
    }

    const { data: monitoringSession } = await supabase.auth.getSession();
    if (!monitoringSession.session) {
      setErrors({ form: 'Session expired. Sign in again with your email.' });
      return;
    }

    await setLastProduct('monitoring');
    router.replace('/inverter/create-pin');
  }, [company, country, module, name, router, setProfile, title]);

  return (
    <MonitoringScreenShell>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom + 32 }]}>
          <MonitoringAuthHeader step={3} onBack={() => router.back()} />
          <MonitoringProgressBar filledSegments={3} />

          <Text style={styles.heading}>Create your account.</Text>
          <Text style={styles.subtext}>Tell us a bit about you before setting up your PIN.</Text>

          <View style={styles.fields}>
            <ProfileTextField
              label="Full Name"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder="James Osei"
              autoCapitalize="words"
              autoCorrect={false}
              error={errors.name}
              onBlur={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />

            <ProfileTextField
              label="Company Name"
              optional
              value={company}
              onChangeText={setCompany}
              placeholder="Accra Power Holdings"
              autoCapitalize="words"
              onBlur={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />

            <ProfileTextField
              label="Job Title"
              optional
              value={title}
              onChangeText={setTitle}
              placeholder="Operations Director"
              autoCapitalize="words"
              onBlur={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />

            <View style={styles.countryBlock}>
              <Text style={styles.countryLabel}>Country</Text>
              <AuthPressable
                style={styles.countryButton}
                onPress={() => setPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Select country"
              >
                <Text style={styles.countryValue}>
                  {country.flag}  {country.name}
                </Text>
                <Ionicons name="chevron-down" size={20} color={INVERTER_AUTH.TEAL} />
              </AuthPressable>
            </View>
          </View>

          {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

          <View style={styles.buttonWrap}>
            <MonitoringTealButton
              label="Create My Account →"
              onPress={() => void handleRegister()}
              active={canSubmit}
              disabled={!canSubmit}
              loading={loading}
            />
          </View>

          <View style={styles.securityNote}>
            <Ionicons name="lock-closed" size={14} color={INVERTER_AUTH.TEAL} />
            <Text style={styles.securityText}>Your information is never shared.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={pickerOpen}
        countries={INVERTER_COUNTRIES}
        selected={country}
        onSelect={setCountry}
        onClose={() => setPickerOpen(false)}
      />
    </MonitoringScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  heading: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.bold,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtext: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  fields: {
    gap: 16,
  },
  countryBlock: {
    gap: 8,
  },
  countryLabel: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.semibold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  countryButton: {
    height: 56,
    borderRadius: INVERTER_AUTH.INPUT_RADIUS,
    borderWidth: 1.5,
    borderColor: INVERTER_AUTH.BORDER_DEFAULT,
    backgroundColor: INVERTER_AUTH.BG_SURFACE,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryValue: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.regular,
    fontSize: 16,
  },
  formError: {
    marginTop: 12,
    color: INVERTER_AUTH.ERROR,
    fontFamily: inter.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  buttonWrap: {
    marginTop: 28,
    marginBottom: 32,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityText: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 13,
  },
});

