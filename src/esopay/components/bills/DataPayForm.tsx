import { memo, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'phosphor-react-native';
import type { UtilityProvider } from '@/esopay/api/types';
import type { EsoPayBeneficiary } from '@/esopay/storage/beneficiaries';
import type { CategoryBillerEntry } from '@/esopay/lib/buildCategoryBillPayCards';
import { getStaticDataBundles } from '@/esopay/data/bundles';
import {
  buildDataPlanCards,
  countDataPlansByTab,
  filterDataPlansByTab,
  type DataPlanCard,
  type DataPlanTab,
} from '@/esopay/lib/telecomNetworks';
import { TelecomPhoneRow } from '@/esopay/components/bills/TelecomPhoneRow';
import { UtilityPayEntrance } from '@/esopay/components/bills/UtilityPayEntrance';
import { utilityPayChrome as chrome } from '@/esopay/theme/utilityPayChrome';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrencyCompact } from '@/esopay/utils/currency';

const TAB_ORDER: { id: DataPlanTab; label: string }[] = [
  { id: 'hot', label: 'HOT' },
  { id: 'daily', label: 'DAILY' },
  { id: 'weekly', label: 'WEEKLY' },
  { id: 'monthly', label: 'MONTHLY' },
];

type Props = {
  network: CategoryBillerEntry;
  networks: CategoryBillerEntry[];
  liveProviders: UtilityProvider[] | undefined;
  phone: string;
  selectedPlanId: string | null;
  validationError: string | null;
  beneficiaries: EsoPayBeneficiary[];
  payLabel?: string;
  payDisabled?: boolean;
  paddingBottom: number;
  onSelectNetwork: (entry: CategoryBillerEntry) => void;
  onPhoneChange: (digits: string) => void;
  onSelectBeneficiary: (item: EsoPayBeneficiary) => void;
  onSelectPlan: (plan: DataPlanCard) => void;
  onPay: () => void;
};

export const DataPayForm = memo(function DataPayForm({
  network,
  networks,
  liveProviders,
  phone,
  selectedPlanId,
  validationError,
  beneficiaries,
  payLabel = 'Pay',
  payDisabled = false,
  paddingBottom,
  onSelectNetwork,
  onPhoneChange,
  onSelectBeneficiary,
  onSelectPlan,
  onPay,
}: Props) {
  const [tab, setTab] = useState<DataPlanTab>('hot');

  const allPlans = useMemo(() => {
    const staticBundles = getStaticDataBundles(network.provider);
    return buildDataPlanCards(network, liveProviders, staticBundles);
  }, [network, liveProviders]);

  const tabCounts = useMemo(() => countDataPlansByTab(allPlans), [allPlans]);

  const availableTabs = useMemo(
    () => TAB_ORDER.filter((t) => tabCounts[t.id] > 0),
    [tabCounts],
  );

  useEffect(() => {
    if (availableTabs.length === 0) return;
    if (!availableTabs.some((t) => t.id === tab)) {
      setTab(availableTabs[0].id);
    }
  }, [availableTabs, tab]);

  const plans = useMemo(() => filterDataPlansByTab(allPlans, tab), [allPlans, tab]);

  const phoneReady = phone.trim().length >= 10;
  const canPay = !payDisabled && Boolean(selectedPlanId) && phoneReady;
  const phoneHint =
    phone.length > 0 && phone.length < 10 ? 'Enter a full 11-digit phone number' : null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[chrome.screenPad, { paddingBottom }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <UtilityPayEntrance index={0}>
        <View style={styles.phoneBlock}>
          <TelecomPhoneRow
            network={network}
            networks={networks}
            phone={phone}
            beneficiaries={beneficiaries}
            onSelectNetwork={onSelectNetwork}
            onPhoneChange={onPhoneChange}
            onSelectBeneficiary={onSelectBeneficiary}
          />
          {phoneHint ? <Text style={styles.hint}>{phoneHint}</Text> : null}
        </View>
      </UtilityPayEntrance>

      <UtilityPayEntrance index={1}>
      <View style={[chrome.surface, chrome.surfacePad]}>
        <View style={styles.plansHeader}>
          <Text style={chrome.sectionTitle}>Data plans</Text>
          <Text style={styles.planCount}>
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
          </Text>
        </View>

        {availableTabs.length > 0 ? (
          <View style={styles.tabs}>
            {availableTabs.map((t) => {
              const active = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setTab(t.id);
                  }}
                  style={styles.tab}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                  <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {plans.length === 0 ? (
          <Text style={styles.empty}>No plans in this category</Text>
        ) : (
          <View style={styles.grid}>
            {plans.map((plan) => {
              const selected = selectedPlanId === plan.id;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    onSelectPlan(plan);
                  }}
                  style={({ pressed }) => [
                    chrome.tile,
                    styles.planTile,
                    selected && chrome.tileActive,
                    pressed && styles.tilePressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${plan.label} ${plan.validity}, ${formatCurrencyCompact(plan.amountKobo)}`}
                >
                  {selected ? (
                    <View style={chrome.tileCheck}>
                      <Check size={11} color="#0A0A0A" weight="bold" />
                    </View>
                  ) : null}
                  <Text style={styles.planData}>{plan.label}</Text>
                  <Text style={styles.planValidity}>{plan.validity}</Text>
                  <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                    {formatCurrencyCompact(plan.amountKobo)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {validationError ? <Text style={chrome.error}>{validationError}</Text> : null}

        <View style={styles.footerBlock}>
          <Text style={styles.footerHint}>
            {selectedPlanId ? 'Ready to continue' : 'Select a data plan to continue'}
          </Text>
          <Pressable
            onPress={onPay}
            disabled={!canPay}
            style={[chrome.payWide, !canPay && chrome.payPillDisabled]}
            accessibilityRole="button"
            accessibilityLabel={payLabel}
            accessibilityState={{ disabled: !canPay }}
          >
            <Text style={[chrome.payPillText, !canPay && chrome.payPillTextDisabled]}>
              {selectedPlanId ? payLabel : 'Select a plan'}
            </Text>
          </Pressable>
        </View>
      </View>
      </UtilityPayEntrance>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  phoneBlock: { gap: 8 },
  hint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 6,
  },
  plansHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  planCount: {
    fontFamily: fonts.ui,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.2,
  },
  tabs: {
    flexDirection: 'row',
    gap: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tab: {
    paddingBottom: 10,
    minWidth: 44,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabUnderline: {
    marginTop: 8,
    height: 2,
    width: '100%',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  planTile: {
    width: '31.2%',
    minHeight: 102,
    paddingHorizontal: 8,
    paddingVertical: 14,
    gap: 4,
  },
  tilePressed: { opacity: 0.9 },
  planData: {
    fontFamily: fonts.uiBold,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.35,
    textAlign: 'center',
    includeFontPadding: false,
  },
  planValidity: {
    fontFamily: fonts.ui,
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.2,
    textAlign: 'center',
    includeFontPadding: false,
  },
  planPrice: {
    marginTop: 4,
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: -0.1,
    textAlign: 'center',
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  planPriceSelected: {
    color: '#FFFFFF',
  },
  empty: {
    fontFamily: fonts.ui,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingVertical: 28,
  },
  footerBlock: {
    gap: 12,
    marginTop: 4,
  },
  footerHint: {
    textAlign: 'center',
    fontFamily: fonts.ui,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.15,
  },
});
