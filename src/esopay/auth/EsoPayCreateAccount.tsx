import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, ChevronDown, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paramString } from '@/lib/authRouteParams';
import {
  getEsoPayCurrentUser,
  isEsoPayProfileComplete,
  saveEsoPayProfile,
} from '@/lib/authProfile';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import {
  ESOPAY_PIN_SETUP_ROUTE,
} from '@/lib/navigation/productRoutes';
import { resolveEsoPayLaunchRoute } from '@/esopay/navigation/resolveEsoPayLaunchRoute';

import {
  formatNigerianPhoneLocal,
  isValidNigerianPhone,
  normalizeNigerianPhone,
  phoneDigits,
} from '@/lib/phoneValidation';
import { esoPaySupabase } from '@/esopay/lib/supabasePay';
import { completeEsoPayEmailSignIn } from '@/esopay/auth/syncEsoPaySession';
import { AUTH_INPUT_BORDER } from '@/esopay/auth/esoPaySignInTheme';
import { ds } from '@/esopay/theme/designSystem';
import { ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { GOLD } from '@/theme/colors';

type Country = {
  code: string;
  flag: string;
  name: string;
};

const COUNTRIES: Country[] = [
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: 'OT', flag: '🌍', name: 'Other' },
];

const COUNTRY_ROW_HEIGHT = 56;

function validateOptionalNigerianPhone(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  const digits = phoneDigits(trimmed);
  if (digits.length < 10) return false;
  return isValidNigerianPhone(trimmed);
}

export default function EsoPayCreateAccount() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const email = paramString(params.email);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [formError, setFormError] = useState('');

  const isValid = fullName.length > 2;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await getEsoPayCurrentUser();
      if (cancelled) return;
      if (isEsoPayProfileComplete(user)) {
        router.replace(await resolveEsoPayLaunchRoute(user?.id));
        return;
      }
      const meta = user?.user_metadata ?? {};
      if (meta.full_name?.trim()) setFullName(meta.full_name.trim());
      if (meta.phone?.trim()) setPhone(formatNigerianPhoneLocal(meta.phone.trim()));
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleNameBlur = useCallback(() => {
    if (fullName.length > 0 && fullName.length < 3) {
      setNameError('Please enter your full name');
    } else {
      setNameError('');
    }
  }, [fullName.length]);

  const handleCreateAccount = useCallback(async () => {
    if (!isValid || loading) return;

    if (!validateOptionalNigerianPhone(phone)) {
      setFormError('Enter a valid Nigerian number');
      return;
    }

    setLoading(true);
    setFormError('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const normalizedPhone = phone.trim() ? normalizeNigerianPhone(phone) : '';
      const saved = await saveEsoPayProfile({
        name: fullName.trim(),
        phone: normalizedPhone || null,
        country: selectedCountry,
      });

      if (!saved.ok) {
        setFormError(saved.error || 'Something went wrong. Try again.');
        return;
      }

      const { data } = await esoPaySupabase.auth.getSession();
      if (!data.session) {
        setFormError('Session expired. Sign in again with your email.');
        return;
      }

      await completeEsoPayEmailSignIn(data.session);
      await setLastProduct('esopay');
      await setOnboardingComplete();

      router.dismissAll();
      router.replace(ESOPAY_PIN_SETUP_ROUTE);
    } catch {
      setFormError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [fullName, isValid, loading, phone, router, selectedCountry]);

  const renderCountryRow = useCallback(
    ({ item }: { item: Country }) => {
      const selected = item.code === selectedCountry.code;
      return (
        <TouchableOpacity
          style={[styles.countryRow, selected && styles.countryRowSelected]}
          onPress={() => {
            setSelectedCountry(item);
            setShowCountryModal(false);
          }}
          accessibilityRole="button"
          accessibilityLabel={item.name}
        >
          <Text style={styles.countryFlag}>{item.flag}</Text>
          <Text style={styles.countryName}>{item.name}</Text>
          {selected ? <View style={styles.countryCheck} /> : null}
        </TouchableOpacity>
      );
    },
    [selectedCountry.code],
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={ds.color.bg} />

      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft color={GOLD} size={22} />
          </TouchableOpacity>
          <Text style={styles.stepText}>3 of 3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.brandRow}>
          <View style={styles.brandCircle}>
            <Wallet color={GOLD} size={18} />
          </View>
          <Text style={styles.brandLabel}>ESO PAY</Text>
        </View>

        <Text style={styles.headline}>Create your account.</Text>

        <Text style={styles.subtext} numberOfLines={1}>
          Your name activates your Eso Pay wallet.
        </Text>

        <Text style={styles.fieldLabel}>Full name</Text>
        <TextInput
          style={[
            styles.nameInput,
            { borderColor: nameFocused ? AUTH_INPUT_BORDER.focus : AUTH_INPUT_BORDER.rest },
          ]}
          placeholder="James Osei"
          placeholderTextColor="rgba(255,255,255,0.3)"
          autoComplete="off"
          textContentType="none"
          autoCapitalize="words"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            setFormError('');
            if (nameError && text.length >= 3) setNameError('');
          }}
          onFocus={() => setNameFocused(true)}
          onBlur={() => {
            setNameFocused(false);
            handleNameBlur();
          }}
          underlineColorAndroid="transparent"
        />
        {nameError ? (
          <Text style={styles.nameError}>{nameError}</Text>
        ) : (
          <View style={styles.nameSpacer} />
        )}

        <Text style={styles.fieldLabel}>Phone number (optional)</Text>
        <TextInput
          style={[
            styles.phoneInput,
            {
              borderColor: phoneFocused ? AUTH_INPUT_BORDER.focus : AUTH_INPUT_BORDER.rest,
            },
          ]}
          placeholder="0803 123 4567"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="phone-pad"
          autoComplete="off"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setFormError('');
          }}
          onFocus={() => setPhoneFocused(true)}
          onBlur={() => setPhoneFocused(false)}
          underlineColorAndroid="transparent"
        />

        <Text style={styles.fieldLabel}>Country</Text>
        <TouchableOpacity
          style={[
            styles.countrySelector,
            {
              borderColor: showCountryModal ? AUTH_INPUT_BORDER.focus : AUTH_INPUT_BORDER.rest,
            },
          ]}
          onPress={() => setShowCountryModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Select country"
        >
          <View style={styles.countrySelectorLeft}>
            <Text style={styles.countrySelectorFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.countrySelectorName}>{selectedCountry.name}</Text>
          </View>
          <ChevronDown color="rgba(255,255,255,0.4)" size={16} />
        </TouchableOpacity>

        {email ? <Text style={styles.signingUpAs}>Signing up as {email}</Text> : null}

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: isValid || loading ? GOLD : 'rgba(255,255,255,0.08)' },
          ]}
          onPress={() => void handleCreateAccount()}
          disabled={!isValid || loading || Boolean(nameError)}
          accessibilityRole="button"
          accessibilityLabel="Create Eso Pay Account"
        >
          {loading ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <Text
              style={[
                styles.createButtonText,
                { color: isValid ? '#000000' : 'rgba(255,255,255,0.3)' },
              ]}
            >
              Create Eso Pay Account →
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          <Text style={styles.termsMuted}>By tapping Create Eso Pay Account, you agree to our </Text>
          <Text
            style={styles.termsLink}
            onPress={() => void WebBrowser.openBrowserAsync('https://esoenergy.com/terms')}
          >
            Terms of Service
          </Text>
          <Text style={styles.termsMuted}> · </Text>
          <Text
            style={styles.termsLink}
            onPress={() => void WebBrowser.openBrowserAsync('https://esoenergy.com/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>

      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setShowCountryModal(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Country</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryRow}
              getItemLayout={(_, index) => ({
                length: COUNTRY_ROW_HEIGHT,
                offset: COUNTRY_ROW_HEIGHT * index,
                index,
              })}
            />
          </View>
        </View>
      </Modal>
    </View>
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
    marginBottom: 8,
  },
  stepText: {
    color: ESO_PAY_TEXT_SECONDARY,
    fontSize: 13,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  brandCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtext: {
    color: ESO_PAY_TEXT_SECONDARY,
    fontSize: 13,
    marginBottom: 16,
  },
  fieldLabel: {
    color: ESO_PAY_TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 6,
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 4,
  },
  nameError: {
    color: '#FF4444',
    fontSize: 11,
    marginBottom: 6,
  },
  nameSpacer: {
    marginBottom: 10,
  },
  phoneInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 10,
  },
  countrySelector: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  countrySelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countrySelectorFlag: {
    fontSize: 18,
  },
  countrySelectorName: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  signingUpAs: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  formError: {
    color: '#FF4444',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  termsText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsMuted: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    lineHeight: 16,
  },
  termsLink: {
    color: GOLD,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#0F1628',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  countryRow: {
    height: COUNTRY_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  countryRowSelected: {
    backgroundColor: 'rgba(212,168,67,0.1)',
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  countryCheck: {
    backgroundColor: GOLD,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
