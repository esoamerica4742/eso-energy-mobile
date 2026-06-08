import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AuthButton } from '../components/AuthButton';
import { AuthInput } from '../components/AuthInput';
import { AuthTopBar } from '../components/AuthTopBar';
import { KeyboardWrapper } from '../components/KeyboardWrapper';
import { MotionPressable, MotionView } from '@/lib/motion';
import { useAuth } from '../hooks/useAuth';
import {
  getCurrentUser,
  getEsoPayCurrentUser,
  isEsoPayProfileComplete,
  isMonitoringProfileComplete,
  saveEsoPayProfile,
  saveUserProfile,
} from '../lib/authProfile';
import { esoPaySupabase } from '@/esopay/lib/supabasePay';
import { completeEsoPayEmailSignIn } from '@/esopay/auth/syncEsoPaySession';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { ESOPAY_HOME_ROUTE, MONITORING_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import { supabase } from '../lib/supabase';
import { C, COUNTRIES, F } from '../theme/authTheme';

function paramString(value) {
  if (Array.isArray(value)) return value[0] ?? '';
  return (value ?? '').toString();
}

const NAME_RE = /^[a-zA-Z\s'-]{2,}$/;

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = paramString(params.email);
  const module = paramString(params.module) || 'inverter';
  const isEsoPay = module === 'esopay';
  const { setProfile, setOnboardingComplete } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isFormValid = isEsoPay
    ? NAME_RE.test(name.trim()) && Boolean(country?.name)
    : NAME_RE.test(name.trim()) &&
      company.trim().length > 1 &&
      title.trim().length > 1 &&
      Boolean(country?.name);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = isEsoPay ? await getEsoPayCurrentUser() : await getCurrentUser();
      const complete = isEsoPay ? isEsoPayProfileComplete(user) : isMonitoringProfileComplete(user);
      if (cancelled || !complete) return;
      router.replace(isEsoPay ? ESOPAY_HOME_ROUTE : MONITORING_HOME_ROUTE);
    })();
    return () => {
      cancelled = true;
    };
  }, [email, module, router]);

  const handleRegister = async () => {
    const next = {};
    if (!NAME_RE.test(name.trim())) next.name = 'Enter your full name';
    if (!isEsoPay) {
      if (company.trim().length < 2) next.company = 'Enter your company name';
      if (title.trim().length < 2) next.title = 'Enter your job title';
    }
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setIsLoading(true);
    setErrors({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setProfile({
      name: name.trim(),
      company: isEsoPay ? '' : company.trim(),
      title: isEsoPay ? '' : title.trim(),
      country,
    });

    const saved = isEsoPay
      ? await saveEsoPayProfile({
          name: name.trim(),
          phone,
          country,
        })
      : await saveUserProfile({
          name: name.trim(),
          company: company.trim(),
          title: title.trim(),
          country,
          module,
        });

    setIsLoading(false);

    if (!saved.ok) {
      setErrors({ form: saved.error || 'Could not save your profile. Try again.' });
      return;
    }

    if (isEsoPay) {
      const { data } = await esoPaySupabase.auth.getSession();
      if (!data.session) {
        setErrors({ form: 'Session expired. Sign in again with your email.' });
        return;
      }
      try {
        await completeEsoPayEmailSignIn(data.session);
        await setLastProduct('esopay');
      } catch {
        setErrors({ form: 'Profile saved but Eso Pay session failed. Sign in again.' });
        return;
      }
      setOnboardingComplete(true);
      router.dismissAll();
      router.replace(ESOPAY_HOME_ROUTE);
      return;
    }

    const { data: monitoringSession } = await supabase.auth.getSession();
    if (!monitoringSession.session) {
      setErrors({ form: 'Session expired. Sign in again with your email.' });
      return;
    }

    await setLastProduct('monitoring');
    setOnboardingComplete(true);
    router.dismissAll();
    router.replace(MONITORING_HOME_ROUTE);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardWrapper>
        <View style={styles.pad}>
          <AuthTopBar step={3} progressPercent={100} />

          <MotionView variant="fadeInDown" delay={0} style={{ marginTop: 48 }}>
            <Text style={styles.headline}>
              {isEsoPay ? 'Create your account.' : 'Almost there.'}
            </Text>
            <Text style={styles.sub}>
              {isEsoPay
                ? 'A few details for your personal Eso Pay wallet.'
                : 'Tell us a little about yourself.'}
            </Text>
          </MotionView>

          <View style={{ marginTop: 40 }}>
            <AuthInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="James Osei"
              autoFocus
              autoCapitalize="words"
              error={errors.name}
              onBlur={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />
            {isEsoPay ? (
              <View style={{ marginTop: 20 }}>
                <AuthInput
                  label="Phone (optional)"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="0803 123 4567"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  onBlur={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />
              </View>
            ) : (
              <>
                <View style={{ marginTop: 20 }}>
                  <AuthInput
                    label="Company Name"
                    value={company}
                    onChangeText={setCompany}
                    placeholder="Accra Power Holdings"
                    autoCapitalize="words"
                    error={errors.company}
                    onBlur={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  />
                </View>
                <View style={{ marginTop: 20 }}>
                  <AuthInput
                    label="Job Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Operations Director"
                    autoCapitalize="words"
                    error={errors.title}
                    onBlur={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  />
                </View>
              </>
            )}

            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>Country</Text>
              <MotionPressable
                style={styles.countryBtn}
                haptic="light"
                onPress={() => setPickerOpen(true)}
              >
                <Text style={styles.countryText}>
                  {country.flag}  {country.name}
                </Text>
                <Feather name="chevron-down" size={18} color={C.OFF_WHITE} style={{ opacity: 0.5 }} />
              </MotionPressable>
            </View>
          </View>

          {errors.form ? (
            <Text style={styles.formError}>{errors.form}</Text>
          ) : null}

          <View style={{ marginTop: 36 }}>
            <AuthButton
              label={isEsoPay ? 'Create Eso Pay Account →' : 'Create My Account →'}
              onPress={handleRegister}
              loading={isLoading}
              disabled={!isFormValid}
            />
          </View>

          <View style={styles.trustRow}>
            <Feather name="lock" size={11} color={C.GOLD_MID} />
            <Text style={styles.trustGold}>Your information is never sold.</Text>
          </View>
        </View>
      </KeyboardWrapper>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <MotionPressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)} haptic="none">
          <View style={styles.modalSheet}>
            <ScrollView>
              {COUNTRIES.map((c) => (
                <MotionPressable
                  key={c.name}
                  style={styles.countryOption}
                  haptic="selection"
                  onPress={() => {
                    setCountry(c);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.countryOptionText}>
                    {c.flag}  {c.name}
                  </Text>
                </MotionPressable>
              ))}
            </ScrollView>
          </View>
        </MotionPressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.DARK_1 },
  pad: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  headline: { fontFamily: F.cormorant, fontSize: 44, lineHeight: 48, color: C.WHITE },
  sub: {
    marginTop: 12,
    fontFamily: F.sansLight,
    fontSize: 15,
    color: C.OFF_WHITE,
    opacity: 0.5,
  },
  label: {
    fontFamily: F.sansMed,
    fontSize: 12,
    color: C.OFF_WHITE,
    opacity: 0.5,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  countryBtn: {
    backgroundColor: C.DARK_2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.DARK_3,
    height: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryText: { fontFamily: F.sansLight, fontSize: 16, color: C.WHITE },
  trustRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center' },
  trustGold: {
    marginLeft: 6,
    fontFamily: F.sansLight,
    fontSize: 11,
    color: C.OFF_WHITE,
    opacity: 0.25,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.DARK_2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    maxHeight: 360,
  },
  countryOption: { paddingHorizontal: 24, paddingVertical: 16 },
  countryOptionText: { fontFamily: F.sansMed, fontSize: 16, color: C.WHITE },
  formError: {
    marginTop: 16,
    fontFamily: F.sansLight,
    fontSize: 13,
    color: C.ERROR,
    textAlign: 'center',
  },
});
