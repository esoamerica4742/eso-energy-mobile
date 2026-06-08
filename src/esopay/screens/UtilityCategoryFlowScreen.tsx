import { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { UtilityProvider } from '@/esopay/api/types';
import {
  useRecentUtilityPayments,
  useUtilityProviders,
  useValidateUtilityAccount,
} from '@/esopay/api/hooks/useBilling';
import { BillPayCardGrid } from '@/esopay/components/bills/BillPayCardGrid';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';
import { UtilityAmountPicker } from '@/esopay/components/bills/UtilityAmountPicker';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import type { PaymentBundle } from '@/esopay/data/bundles';
import {
  normalizeUtilityCategorySlug,
  resolveCategoryBillers,
  UTILITY_CATEGORY_META,
  type NigeriaBillerMeta,
} from '@/esopay/data/nigeriaBillers';
import { matchesBillFilterTab } from '@/esopay/data/utilities';
import { buildCategoryBillPayGridItems } from '@/esopay/lib/buildCategoryBillPayCards';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { isMonnifyAccountReady } from '@/esopay/services/monnify';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { parseNairaInputToKobo } from '@/esopay/utils/currency';

type FlowStep = 'biller' | 'account' | 'amount';

function StepIndicator({ step }: { step: FlowStep }) {
  const steps: FlowStep[] = ['biller', 'account', 'amount'];
  const index = steps.indexOf(step);
  return (
    <View style={stepStyles.row}>
      {steps.map((s, i) => (
        <View key={s} style={stepStyles.item}>
          <View style={[stepStyles.dot, i <= index && stepStyles.dotActive]} />
          {i < steps.length - 1 ? (
            <View style={[stepStyles.line, i < index && stepStyles.lineActive]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  item: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(201,168,76,0.25)',
  },
  dotActive: { backgroundColor: luxury.gold, width: 10, height: 10, borderRadius: 5 },
  line: {
    width: 36,
    height: 2,
    backgroundColor: 'rgba(201,168,76,0.2)',
    marginHorizontal: 4,
  },
  lineActive: { backgroundColor: luxury.gold },
});

export function UtilityCategoryFlowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const scrollPad = useEsoPayScrollPadding({ tabBar: true, topExtra: 0 });
  const { openPayment } = usePaymentModal();
  const providersQuery = useUtilityProviders();
  const recentQuery = useRecentUtilityPayments({ limit: 24 });
  const validateMutation = useValidateUtilityAccount();

  const slug = normalizeUtilityCategorySlug(
    Array.isArray(params.category) ? params.category[0] : params.category,
  );

  const [step, setStep] = useState<FlowStep>('biller');
  const [selected, setSelected] = useState<{
    provider: UtilityProvider;
    meta: NigeriaBillerMeta;
  } | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [selectedPresetKobo, setSelectedPresetKobo] = useState<number | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);

  const categoryMeta = slug ? UTILITY_CATEGORY_META[slug] : null;

  const liveForCategory = useMemo(() => {
    if (!slug || !providersQuery.data) return [];
    if (slug === 'water') {
      return providersQuery.data.filter((p) => p.category === 'water');
    }
    if (slug === 'waste') {
      return providersQuery.data.filter((p) => /lawma|waste|levy|psp|environment/i.test(p.name));
    }
    const tab = UTILITY_CATEGORY_META[slug].filterTab;
    return providersQuery.data.filter((p) => matchesBillFilterTab(p, tab));
  }, [providersQuery.data, slug]);

  const { billers, offline } = useMemo(() => {
    if (!slug) return { billers: [], offline: false };
    return resolveCategoryBillers(slug, liveForCategory.length ? liveForCategory : undefined);
  }, [slug, liveForCategory]);

  const recentForCategory = useMemo(() => {
    if (!slug) return [];
    const tab = UTILITY_CATEGORY_META[slug].filterTab;
    return (recentQuery.data ?? []).filter((row) => {
      if (slug === 'water') return row.provider.category === 'water';
      if (slug === 'waste') return /lawma|waste|levy|psp|environment/i.test(row.provider.name);
      return matchesBillFilterTab(row.provider, tab);
    });
  }, [recentQuery.data, slug]);

  const amountKobo = selectedPresetKobo ?? parseNairaInputToKobo(amountInput);

  const pickBiller = useCallback(
    (entry: { provider: UtilityProvider; meta: NigeriaBillerMeta }) => {
      void Haptics.selectionAsync();
      setSelected(entry);
      setAccountNumber('');
      setCustomerName(null);
      setValidationError(null);
      setAmountInput('');
      setSelectedPresetKobo(null);
      setSelectedBundleId(null);
      setStep('account');
    },
    [],
  );

  const billPayCards = useMemo(() => {
    if (!slug) return [];
    return buildCategoryBillPayGridItems(slug, billers, recentForCategory, pickBiller);
  }, [billers, pickBiller, recentForCategory, slug]);

  const goBack = useCallback(() => {
    if (step === 'amount') {
      setStep('account');
      return;
    }
    if (step === 'account') {
      setStep('biller');
      setSelected(null);
      setCustomerName(null);
      setValidationError(null);
      return;
    }
    router.back();
  }, [router, step]);

  const verifyAccount = useCallback(() => {
    if (!selected) return;
    const trimmed = accountNumber.trim();
    if (!isMonnifyAccountReady(trimmed)) {
      setValidationError('Enter a valid account or meter number.');
      return;
    }
    validateMutation.mutate(
      {
        provider_id: selected.provider.id,
        account_number: trimmed,
      },
      {
        onSuccess: (result) => {
          if (result.valid) {
            setCustomerName(result.customer_name);
            setValidationError(null);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStep('amount');
          } else {
            setCustomerName(null);
            setValidationError('Account not found. Check the number and try again.');
          }
        },
        onError: () => {
          if (offline && selected.provider.id.startsWith('static-')) {
            setValidationError('Connect to the internet to verify this account.');
            return;
          }
          setValidationError('Could not verify account. Try again.');
        },
      },
    );
  }, [accountNumber, offline, selected, validateMutation]);

  const pay = useCallback(() => {
    if (!selected || amountKobo <= 0) return;
    openPayment({
      provider: selected.provider,
      accountNumber: accountNumber.trim(),
      amountKobo,
      customerName: customerName ?? undefined,
      accountValidated: Boolean(customerName),
      initialStep: 'pin',
    });
  }, [accountNumber, amountKobo, customerName, openPayment, selected]);

  if (!slug || !categoryMeta) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader title="Utilities" canGoBack onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Unknown category.</Text>
        </View>
      </EsoPayScreenShell>
    );
  }

  const headerTitle =
    step === 'biller'
      ? categoryMeta.title
      : step === 'account'
        ? selected?.meta.shortLabel ?? categoryMeta.title
        : 'Select amount';

  return (
    <EsoPayScreenShell>
      <EsoPayHeader title={headerTitle} canGoBack onBack={goBack} />
      <StepIndicator step={step} />

      {offline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline catalog — connect for live billers</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {step === 'biller' ? (
          providersQuery.isLoading && billers.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color={luxury.gold} size="large" />
            </View>
          ) : (
            <BillPayCardGrid
              title="Select provider"
              items={billPayCards}
              paddingBottom={scrollPad.paddingBottom}
            />
          )
        ) : null}

        {step === 'account' && selected ? (
          <View style={[styles.form, { paddingBottom: scrollPad.paddingBottom }]}>
            <View style={styles.selectedChip}>
              <Text style={styles.selectedLabel}>{selected.meta.name}</Text>
              <Text style={styles.selectedState}>{selected.meta.stateLabel}</Text>
            </View>

            <Text style={styles.fieldLabel}>{categoryMeta.accountLabel}</Text>
            <TextInput
              value={accountNumber}
              onChangeText={(text) => {
                setAccountNumber(text);
                setValidationError(null);
              }}
              placeholder={categoryMeta.accountPlaceholder}
              placeholderTextColor={luxury.textDim}
              keyboardType="number-pad"
              style={styles.input}
              autoFocus
            />

            {validationError ? <Text style={styles.fieldError}>{validationError}</Text> : null}

            <GoldCTAButton
              label={validateMutation.isPending ? 'Verifying…' : 'Verify account'}
              onPress={verifyAccount}
              isDisabled={validateMutation.isPending || !accountNumber.trim()}
            />
          </View>
        ) : null}

        {step === 'amount' && selected && slug ? (
          <UtilityAmountPicker
            slug={slug}
            provider={selected.provider}
            customerName={customerName}
            accountNumber={accountNumber.trim()}
            amountInput={amountInput}
            selectedBundleId={selectedBundleId}
            selectedPresetKobo={selectedPresetKobo}
            paddingBottom={scrollPad.paddingBottom}
            onAmountInputChange={setAmountInput}
            onSelectBundle={(bundle: PaymentBundle) => {
              setSelectedBundleId(bundle.id);
              setSelectedPresetKobo(bundle.amountKobo);
              setAmountInput(String(bundle.amountKobo / 100));
            }}
            onSelectPreset={(kobo) => {
              setSelectedBundleId(null);
              setSelectedPresetKobo(kobo);
              setAmountInput(String(kobo / 100));
            }}
            onClearSelection={() => {
              setSelectedBundleId(null);
              setSelectedPresetKobo(null);
            }}
            onPay={pay}
          />
        ) : null}
      </KeyboardAvoidingView>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offlineBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.28)',
  },
  offlineText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: luxury.gold,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  selectedChip: {
    backgroundColor: luxury.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    padding: spacing.md,
    gap: 2,
  },
  selectedLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: luxury.textPrimary,
  },
  selectedState: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: luxury.textMuted,
  },
  fieldLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: luxury.gold,
  },
  input: {
    fontFamily: fonts.ui,
    fontSize: 18,
    color: luxury.textPrimary,
    backgroundColor: luxury.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  fieldError: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#E05252',
  },
  errorText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: luxury.textMuted,
  },
});
