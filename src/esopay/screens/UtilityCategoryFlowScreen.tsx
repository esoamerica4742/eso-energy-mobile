import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEsoPayBack } from '@/esopay/navigation/useEsoPayBack';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import {
  HOME_BILL_GRID_COLUMN_GAP,
  HOME_BILL_GRID_ROW_GAP,
  PROVIDER_BILL_CARD_HEIGHT,
} from '@/esopay/components/bills/billPayCardTheme';
import { AirtimePayForm } from '@/esopay/components/bills/AirtimePayForm';
import { DataPayForm } from '@/esopay/components/bills/DataPayForm';
import { ElectricityPayForm } from '@/esopay/components/bills/ElectricityPayForm';
import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { BeneficiaryChips } from '@/esopay/components/BeneficiaryChips';
import { UtilityAmountPicker } from '@/esopay/components/bills/UtilityAmountPicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import {
  AIRTIME_MANUAL_MAX_KOBO,
  AIRTIME_MANUAL_MIN_KOBO,
  getFixedPlanAmountKobo,
  type PaymentBundle,
} from '@/esopay/data/bundles';
import {
  normalizeUtilityCategorySlug,
  resolveCategoryBillers,
  UTILITY_CATEGORY_META,
  type NigeriaBillerMeta,
} from '@/esopay/data/nigeriaBillers';
import { matchesBillFilterTab } from '@/esopay/data/utilities';
import {
  buildCategoryBillPayGridItems,
  type CategoryBillerEntry,
} from '@/esopay/lib/buildCategoryBillPayCards';
import {
  companyGroupKey,
  defaultMeterType,
  entryForMeter,
  findCompanyForBillerCode,
  groupElectricityCompanies,
  orderElectricityCompanies,
  preferElectricityCompany,
  type ElectricityCompanyGroup,
  type ElectricityMeterType,
} from '@/esopay/lib/electricityCompanies';
import {
  findNetworkByCode,
  preferTelecomNetwork,
  resolveTelecomNetworks,
  type DataPlanCard,
} from '@/esopay/lib/telecomNetworks';
import { useBeneficiaries } from '@/esopay/hooks/useBeneficiaries';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { esopayUtilityHistoryHref } from '@/esopay/navigation/routes';
import { isMonnifyAccountReady } from '@/esopay/services/monnify';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency, parseNairaInputToKobo } from '@/esopay/utils/currency';
import { maskAccountNumber } from '@/esopay/lib/resolveTrustedPaymentTarget';

type FlowStep = 'biller' | 'pay';

function StepIndicator({ step }: { step: FlowStep }) {
  const steps: FlowStep[] = ['biller', 'pay'];
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
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: {
    backgroundColor: ESO_PAY_TEXT_PRIMARY,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 48,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 4,
  },
  lineActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
});

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function UtilityCategoryFlowScreen() {
  const esoPayBack = useEsoPayBack();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; biller?: string }>();
  const insets = useSafeAreaInsets();
  const scrollPad = useEsoPayScrollPadding({ tabBar: true, topExtra: 0 });
  const { openPayment } = usePaymentModal();
  const providersQuery = useUtilityProviders({ forceSync: true });
  const recentQuery = useRecentUtilityPayments({ limit: 24 });
  const validateMutation = useValidateUtilityAccount();

  const slug = normalizeUtilityCategorySlug(
    Array.isArray(params.category) ? params.category[0] : params.category,
  );
  const deepLinkBiller = Array.isArray(params.biller) ? params.biller[0] : params.biller;
  const isElectricity = slug === 'electricity';
  const isAirtime = slug === 'airtime';
  const isData = slug === 'data';
  const isTelecom = isAirtime || isData;
  const isOpayCategory = isElectricity || isTelecom;

  const [step, setStep] = useState<FlowStep>('biller');
  const [selected, setSelected] = useState<{
    provider: UtilityProvider;
    meta: NigeriaBillerMeta;
  } | null>(null);
  const [telecomNetwork, setTelecomNetwork] = useState<CategoryBillerEntry | null>(null);
  const [electricCompany, setElectricCompany] = useState<ElectricityCompanyGroup | null>(null);
  const [meterType, setMeterType] = useState<ElectricityMeterType>('prepaid');
  const { beneficiaries: providerBeneficiaries, allBeneficiaries } = useBeneficiaries(
    selected?.provider.id,
  );
  const electricityBeneficiaries = useMemo(() => {
    if (!electricCompany) return [];
    const ids = new Set(
      [electricCompany.prepaid?.provider.id, electricCompany.postpaid?.provider.id].filter(
        Boolean,
      ) as string[],
    );
    return allBeneficiaries.filter((item) => ids.has(item.providerId));
  }, [allBeneficiaries, electricCompany]);
  const telecomBeneficiaries = useMemo(() => {
    if (!telecomNetwork) return [];
    const code = normalizeKey(telecomNetwork.meta.shortLabel);
    return allBeneficiaries.filter(
      (item) =>
        item.providerId === telecomNetwork.provider.id ||
        normalizeKey(item.providerName).includes(code),
    );
  }, [allBeneficiaries, telecomNetwork]);
  const [accountNumber, setAccountNumber] = useState('');
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [selectedPresetKobo, setSelectedPresetKobo] = useState<number | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [deepLinkApplied, setDeepLinkApplied] = useState(false);

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

  const { billers, offline: categoryOffline } = useMemo(() => {
    if (!slug) return { billers: [], offline: false };
    return resolveCategoryBillers(slug, liveForCategory.length ? liveForCategory : undefined);
  }, [slug, liveForCategory]);

  const { networks: telecomNetworks, offline: telecomOffline } = useMemo(() => {
    if (!isTelecom) return { networks: [] as CategoryBillerEntry[], offline: false };
    return resolveTelecomNetworks(
      slug as 'airtime' | 'data',
      liveForCategory.length ? liveForCategory : undefined,
    );
  }, [isTelecom, liveForCategory, slug]);

  const offline = isTelecom ? telecomOffline : categoryOffline;

  const recentForCategory = useMemo(() => {
    if (!slug) return [];
    const tab = UTILITY_CATEGORY_META[slug].filterTab;
    return (recentQuery.data ?? []).filter((row) => {
      if (slug === 'water') return row.provider.category === 'water';
      if (slug === 'waste') return /lawma|waste|levy|psp|environment/i.test(row.provider.name);
      return matchesBillFilterTab(row.provider, tab);
    });
  }, [recentQuery.data, slug]);

  const electricityCompanies = useMemo(() => {
    if (!isElectricity) return [] as ElectricityCompanyGroup[];
    const groups = groupElectricityCompanies(billers);
    return orderElectricityCompanies(groups, recentForCategory);
  }, [billers, isElectricity, recentForCategory]);

  const lastPayAgain = recentForCategory[0] ?? null;

  const runCategoryPayAgain = useCallback(() => {
    if (!lastPayAgain) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openPayment({
      provider: lastPayAgain.provider,
      accountNumber: lastPayAgain.account_number,
      amountKobo: lastPayAgain.amount_kobo,
    });
  }, [lastPayAgain, openPayment]);

  const amountKobo = selectedPresetKobo ?? parseNairaInputToKobo(amountInput);

  const applyFixedPlanAmount = useCallback((provider: UtilityProvider) => {
    const fixed = getFixedPlanAmountKobo(provider);
    if (fixed == null) return;
    setSelectedBundleId(`live-${provider.id}`);
    setSelectedPresetKobo(fixed);
    setAmountInput(String(fixed / 100));
  }, []);

  const resetPayFields = useCallback(() => {
    setAccountNumber('');
    setCustomerName(null);
    setValidationError(null);
    setAmountInput('');
    setSelectedPresetKobo(null);
    setSelectedBundleId(null);
  }, []);

  const applyElectricSelection = useCallback(
    (company: ElectricityCompanyGroup, meter: ElectricityMeterType) => {
      const entry = entryForMeter(company, meter);
      if (!entry) return;
      void Haptics.selectionAsync();
      setElectricCompany(company);
      setMeterType(meter);
      setSelected(entry);
      resetPayFields();
      applyFixedPlanAmount(entry.provider);
      setStep('pay');
    },
    [applyFixedPlanAmount, resetPayFields],
  );

  const pickElectricCompany = useCallback(
    (company: ElectricityCompanyGroup) => {
      const meter = defaultMeterType(company);
      applyElectricSelection(company, meter);
      // Warm path: restore last meter for this DISCO when available.
      const last = recentForCategory.find((row) => {
        const code = normalizeKey(row.provider.monnify_biller_code);
        const entries = [company.prepaid, company.postpaid].filter(Boolean) as CategoryBillerEntry[];
        return entries.some(
          (e) =>
            e.provider.id === row.provider.id ||
            normalizeKey(e.meta.monnify_biller_code) === code ||
            companyGroupKey(e.meta) === company.id,
        );
      });
      if (last?.account_number) {
        setAccountNumber(last.account_number.replace(/\D/g, ''));
      }
    },
    [applyElectricSelection, recentForCategory],
  );

  const pickBiller = useCallback(
    (entry: { provider: UtilityProvider; meta: NigeriaBillerMeta }) => {
      void Haptics.selectionAsync();
      setSelected(entry);
      setElectricCompany(null);
      setTelecomNetwork(null);
      resetPayFields();
      applyFixedPlanAmount(entry.provider);
      setStep('pay');
    },
    [applyFixedPlanAmount, resetPayFields],
  );

  const pickTelecomNetwork = useCallback(
    (
      entry: CategoryBillerEntry,
      opts?: { keepPhone?: boolean; keepAmount?: boolean; phone?: string },
    ) => {
      void Haptics.selectionAsync();
      setTelecomNetwork(entry);
      setSelected(entry);
      setElectricCompany(null);
      setCustomerName(null);
      setValidationError(null);
      if (!opts?.keepPhone && !opts?.phone) {
        setAccountNumber('');
      } else if (opts.phone) {
        setAccountNumber(opts.phone.replace(/\D/g, ''));
      }
      if (!opts?.keepAmount) {
        setAmountInput('');
        setSelectedPresetKobo(null);
        setSelectedBundleId(null);
      }
      setStep('pay');
    },
    [],
  );

  const onMeterTypeChange = useCallback(
    (meter: ElectricityMeterType) => {
      if (!electricCompany) return;
      const entry = entryForMeter(electricCompany, meter);
      if (!entry) return;
      setMeterType(meter);
      setSelected(entry);
      setCustomerName(null);
      setValidationError(null);
      applyFixedPlanAmount(entry.provider);
    },
    [applyFixedPlanAmount, electricCompany],
  );

  const onSelectDataPlan = useCallback((plan: DataPlanCard) => {
    setSelected({ provider: plan.provider, meta: plan.meta });
    setSelectedBundleId(plan.id);
    setSelectedPresetKobo(plan.amountKobo);
    setAmountInput(String(plan.amountKobo / 100));
    setValidationError(null);
  }, []);

  // Opay airtime/data: land on pay with last-used network + phone when available.
  useEffect(() => {
    if (!isTelecom || telecomNetwork || telecomNetworks.length === 0) return;
    if (deepLinkBiller) return;
    const last = recentForCategory[0];
    const preferred = preferTelecomNetwork(
      telecomNetworks,
      last?.provider.monnify_biller_code ?? last?.provider.name,
    );
    if (!preferred) return;
    pickTelecomNetwork(preferred, {
      phone: last?.account_number,
      keepAmount: false,
    });
  }, [
    deepLinkBiller,
    isTelecom,
    pickTelecomNetwork,
    recentForCategory,
    telecomNetwork,
    telecomNetworks,
  ]);

  // Opay electricity: land on pay with DISCO dropdown (no full company list first).
  useEffect(() => {
    if (!isElectricity || electricCompany || electricityCompanies.length === 0) return;
    if (deepLinkBiller) return;
    const preferred = preferElectricityCompany(electricityCompanies, recentForCategory);
    if (preferred) pickElectricCompany(preferred);
  }, [
    deepLinkBiller,
    electricCompany,
    electricityCompanies,
    isElectricity,
    pickElectricCompany,
    recentForCategory,
  ]);

  useEffect(() => {
    if (deepLinkApplied || !deepLinkBiller) return;
    if (isElectricity) {
      if (electricityCompanies.length === 0) return;
      const match = findCompanyForBillerCode(electricityCompanies, deepLinkBiller);
      if (match) {
        setDeepLinkApplied(true);
        applyElectricSelection(match.company, match.meter);
      }
      return;
    }
    if (isTelecom) {
      if (telecomNetworks.length === 0) return;
      const match = findNetworkByCode(telecomNetworks, deepLinkBiller);
      if (match) {
        setDeepLinkApplied(true);
        pickTelecomNetwork(match);
      }
      return;
    }
    if (billers.length === 0) return;
    const codeKey = normalizeKey(deepLinkBiller);
    const match = billers.find(
      (b) =>
        normalizeKey(b.meta.monnify_biller_code) === codeKey ||
        normalizeKey(b.provider.monnify_biller_code) === codeKey,
    );
    if (match) {
      setDeepLinkApplied(true);
      pickBiller(match);
    }
  }, [
    applyElectricSelection,
    billers,
    deepLinkApplied,
    deepLinkBiller,
    electricityCompanies,
    isElectricity,
    isTelecom,
    pickBiller,
    pickTelecomNetwork,
    telecomNetworks,
  ]);

  const billPayCards = useMemo(() => {
    if (!slug || isOpayCategory) return [];
    return buildCategoryBillPayGridItems(slug, billers, recentForCategory, pickBiller);
  }, [billers, isOpayCategory, pickBiller, recentForCategory, slug]);

  const goBack = useCallback(() => {
    if (isTelecom || isElectricity) {
      esoPayBack();
      return;
    }
    if (step === 'pay') {
      setStep('biller');
      setSelected(null);
      setElectricCompany(null);
      setTelecomNetwork(null);
      setCustomerName(null);
      setValidationError(null);
      return;
    }
    esoPayBack();
  }, [esoPayBack, isElectricity, isTelecom, step]);

  const pay = useCallback(() => {
    if (!selected || amountKobo <= 0) return;
    if (slug === 'airtime') {
      if (amountKobo < AIRTIME_MANUAL_MIN_KOBO) {
        setValidationError('Minimum airtime is ₦50');
        return;
      }
      if (amountKobo > AIRTIME_MANUAL_MAX_KOBO) {
        setValidationError('Maximum airtime is ₦1,000,000');
        return;
      }
    }
    const trimmed = accountNumber.trim();
    if (!isMonnifyAccountReady(trimmed)) {
      setValidationError('Enter a valid account or meter number.');
      return;
    }

    const openWithPin = (name: string | null, validated: boolean) => {
      openPayment({
        provider: selected.provider,
        accountNumber: trimmed,
        amountKobo,
        customerName: name ?? undefined,
        accountValidated: validated,
        initialStep: 'pin',
      });
    };

    if (customerName) {
      openWithPin(customerName, true);
      return;
    }

    validateMutation.mutate(
      {
        provider_id: selected.provider.id,
        account_number: trimmed,
        amount_kobo: amountKobo,
      },
      {
        onSuccess: (result) => {
          if (result.valid) {
            setCustomerName(result.customer_name);
            setValidationError(null);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            openWithPin(result.customer_name, true);
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
  }, [
    accountNumber,
    amountKobo,
    customerName,
    offline,
    openPayment,
    selected,
    slug,
    validateMutation,
  ]);

  if (!slug || !categoryMeta) {
    return (
      <EsoPayScreenShell>
        <EsoPayHeader title="Utilities" canGoBack onBack={esoPayBack} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Unknown category.</Text>
        </View>
      </EsoPayScreenShell>
    );
  }

  const headerTitle = isAirtime
    ? 'Airtime'
    : isData
      ? 'Mobile Data'
      : isElectricity
        ? 'Electricity'
        : step === 'biller'
          ? categoryMeta.title
          : selected?.meta.shortLabel ?? categoryMeta.title;

  const historyAction =
    isElectricity || isAirtime || isData ? (
      <Pressable
        onPress={() =>
          router.push(
            esopayUtilityHistoryHref(
              isElectricity ? 'electricity' : isAirtime ? 'airtime' : 'data',
            ),
          )
        }
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="History"
      >
        <Text style={styles.historyLink}>History</Text>
      </Pressable>
    ) : null;

  const opayLoading =
    (isTelecom && providersQuery.isLoading && telecomNetworks.length === 0) ||
    (isElectricity && providersQuery.isLoading && electricityCompanies.length === 0);

  return (
    <EsoPayScreenShell>
      <EsoPayHeader
        title={headerTitle}
        canGoBack
        onBack={goBack}
        rightAction={historyAction}
      />
      {!isOpayCategory ? <StepIndicator step={step} /> : null}

      {offline && !isOpayCategory ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline catalog — connect for live billers</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {opayLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={ESO_PAY_TEXT_SECONDARY} size="large" />
          </View>
        ) : null}

        {step === 'biller' && !isTelecom && !isElectricity ? (
          providersQuery.isLoading && billers.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color={ESO_PAY_TEXT_SECONDARY} size="large" />
            </View>
          ) : (
            <View style={styles.billerStep}>
              {lastPayAgain ? (
                <Pressable
                  onPress={runCategoryPayAgain}
                  style={({ pressed }) => [
                    styles.payAgainChip,
                    pressed && styles.payAgainChipPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Pay again ${lastPayAgain.provider.name}`}
                >
                  <Text style={styles.payAgainLabel}>Pay again</Text>
                  <Text style={styles.payAgainMeta} numberOfLines={1}>
                    {lastPayAgain.provider.name} ·{' '}
                    {maskAccountNumber(lastPayAgain.account_number)} ·{' '}
                    {formatCurrency(lastPayAgain.amount_kobo)}
                  </Text>
                </Pressable>
              ) : null}
              <BillPayCardGrid
                title="Select provider"
                items={billPayCards}
                paddingBottom={scrollPad.paddingBottom}
                hubCards
                cardHeight={PROVIDER_BILL_CARD_HEIGHT}
                contentPaddingH={16}
                columnGap={HOME_BILL_GRID_COLUMN_GAP}
                rowGap={HOME_BILL_GRID_ROW_GAP}
              />
            </View>
          )
        ) : null}

        {step === 'pay' && selected && slug && isElectricity && electricCompany ? (
          <ElectricityPayForm
            company={electricCompany}
            companies={electricityCompanies}
            meterType={meterType}
            accountNumber={accountNumber}
            amountInput={amountInput}
            selectedPresetKobo={selectedPresetKobo}
            customerName={customerName}
            validationError={validationError}
            beneficiaries={electricityBeneficiaries}
            payLabel={validateMutation.isPending ? '…' : 'Pay'}
            payDisabled={validateMutation.isPending}
            paddingBottom={Math.max(scrollPad.paddingBottom, insets.bottom + 24)}
            onSelectCompany={pickElectricCompany}
            onMeterTypeChange={onMeterTypeChange}
            onAccountNumberChange={(text) => {
              setAccountNumber(text);
              setCustomerName(null);
              setValidationError(null);
            }}
            onSelectBeneficiary={(item) => {
              void Haptics.selectionAsync();
              setAccountNumber(item.accountNumber);
              setCustomerName(item.customerName);
              setValidationError(null);
            }}
            onSelectPreset={(kobo) => {
              setSelectedBundleId(null);
              setSelectedPresetKobo(kobo);
              setAmountInput(String(kobo / 100));
            }}
            onAmountInputChange={setAmountInput}
            onClearPreset={() => {
              setSelectedBundleId(null);
              setSelectedPresetKobo(null);
            }}
            onPay={pay}
          />
        ) : null}

        {step === 'pay' && selected && telecomNetwork && isAirtime ? (
          <AirtimePayForm
            network={telecomNetwork}
            networks={telecomNetworks}
            phone={accountNumber}
            amountInput={amountInput}
            selectedPresetKobo={selectedPresetKobo}
            validationError={validationError}
            beneficiaries={telecomBeneficiaries}
            payLabel={validateMutation.isPending ? '…' : 'Pay'}
            payDisabled={validateMutation.isPending}
            paddingBottom={Math.max(scrollPad.paddingBottom, insets.bottom + 24)}
            onSelectNetwork={(entry) =>
              pickTelecomNetwork(entry, { keepPhone: true, keepAmount: true })
            }
            onPhoneChange={(digits) => {
              setAccountNumber(digits);
              setCustomerName(null);
              setValidationError(null);
            }}
            onSelectBeneficiary={(item) => {
              void Haptics.selectionAsync();
              setAccountNumber(item.accountNumber.replace(/\D/g, ''));
              setCustomerName(item.customerName);
              setValidationError(null);
            }}
            onSelectPreset={(kobo) => {
              setSelectedBundleId(null);
              setSelectedPresetKobo(kobo);
              setAmountInput(String(kobo / 100));
            }}
            onAmountInputChange={setAmountInput}
            onClearPreset={() => {
              setSelectedBundleId(null);
              setSelectedPresetKobo(null);
            }}
            onPay={pay}
          />
        ) : null}

        {step === 'pay' && selected && telecomNetwork && isData ? (
          <DataPayForm
            network={telecomNetwork}
            networks={telecomNetworks}
            liveProviders={liveForCategory}
            phone={accountNumber}
            selectedPlanId={selectedBundleId}
            validationError={validationError}
            beneficiaries={telecomBeneficiaries}
            payLabel={validateMutation.isPending ? '…' : 'Pay'}
            payDisabled={validateMutation.isPending}
            paddingBottom={Math.max(scrollPad.paddingBottom, insets.bottom + 24)}
            onSelectNetwork={(entry) =>
              pickTelecomNetwork(entry, { keepPhone: true, keepAmount: false })
            }
            onPhoneChange={(digits) => {
              setAccountNumber(digits);
              setCustomerName(null);
              setValidationError(null);
            }}
            onSelectBeneficiary={(item) => {
              void Haptics.selectionAsync();
              setAccountNumber(item.accountNumber.replace(/\D/g, ''));
              setCustomerName(item.customerName);
              setValidationError(null);
            }}
            onSelectPlan={onSelectDataPlan}
            onPay={pay}
          />
        ) : null}

        {step === 'pay' && selected && slug && !isOpayCategory ? (
          <View style={styles.payStep}>
            <View style={styles.accountBlock}>
              <View style={styles.selectedChip}>
                <Text style={styles.selectedLabel}>{selected.meta.name}</Text>
                <Text style={styles.selectedState}>{selected.meta.stateLabel}</Text>
              </View>

              <Text style={styles.fieldLabel}>{categoryMeta.accountLabel}</Text>
              <TextInput
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text);
                  setCustomerName(null);
                  setValidationError(null);
                }}
                placeholder={categoryMeta.accountPlaceholder}
                placeholderTextColor={ds.color.textDisabled}
                keyboardType="number-pad"
                style={styles.input}
                autoFocus
              />
              <BeneficiaryChips
                beneficiaries={providerBeneficiaries}
                selectedAccountNumber={accountNumber.trim()}
                onSelect={(item) => {
                  void Haptics.selectionAsync();
                  setAccountNumber(item.accountNumber);
                  setCustomerName(item.customerName);
                  setValidationError(null);
                }}
              />
              {validationError ? <Text style={styles.fieldError}>{validationError}</Text> : null}
            </View>

            <UtilityAmountPicker
              slug={slug}
              provider={selected.provider}
              customerName={customerName}
              accountNumber={accountNumber.trim()}
              amountInput={amountInput}
              selectedBundleId={selectedBundleId}
              selectedPresetKobo={selectedPresetKobo}
              paddingBottom={Math.max(scrollPad.paddingBottom, insets.bottom + 24)}
              payLabel={validateMutation.isPending ? 'Verifying…' : 'Pay'}
              payDisabled={validateMutation.isPending}
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
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  billerStep: { flex: 1 },
  historyLink: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    letterSpacing: -0.1,
    color: 'rgba(255,255,255,0.88)',
  },
  payAgainChip: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 4,
  },
  payAgainChipPressed: { opacity: 0.88 },
  payAgainLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  payAgainMeta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  offlineBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
  },
  offlineText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
  },
  payStep: {
    flex: 1,
  },
  accountBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  selectedChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HOME_CARD_BORDER,
    padding: spacing.md,
    gap: 2,
  },
  selectedLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  selectedState: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  fieldLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 0.2,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  input: {
    fontFamily: fonts.ui,
    fontSize: 18,
    color: ESO_PAY_TEXT_PRIMARY,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
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
    color: ESO_PAY_TEXT_SECONDARY,
  },
});
