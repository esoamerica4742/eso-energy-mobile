import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle2 } from 'lucide-react-native';
import { EsoPayPrimaryButton } from '@/esopay/components/EsoPayButtons';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';
import {
  AIRTIME_MANUAL_MAX_KOBO,
  AIRTIME_MANUAL_MIN_KOBO,
  getFixedPlanAmountKobo,
  getUtilityAmountOptions,
  type PaymentBundle,
} from '@/esopay/data/bundles';
import { UTILITY_AMOUNT_PRESETS_KOBO } from '@/esopay/data/nigeriaBillers';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import type { UtilityProvider } from '@/esopay/api/types';
import {
  ESO_PAY_BG,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency, parseNairaInputToKobo } from '@/esopay/utils/currency';

type Props = {
  slug: UtilityCategorySlug;
  provider: UtilityProvider;
  customerName: string | null;
  accountNumber: string;
  amountInput: string;
  selectedBundleId: string | null;
  selectedPresetKobo: number | null;
  paddingBottom: number;
  payLabel?: string;
  payDisabled?: boolean;
  onAmountInputChange: (value: string) => void;
  onSelectBundle: (bundle: PaymentBundle) => void;
  onSelectPreset: (kobo: number) => void;
  onClearSelection: () => void;
  onPay: () => void;
};

function BundleCard({
  bundle,
  active,
  onPress,
  variant,
}: {
  bundle: PaymentBundle;
  active: boolean;
  onPress: () => void;
  variant: 'row' | 'chip';
}) {
  if (variant === 'chip') {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.presetChip, active && styles.presetChipActive]}
      >
        <Text style={[styles.presetText, active && styles.presetTextActive]}>{bundle.label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.bundleRow, active && styles.bundleRowActive]}
    >
      <View style={styles.bundleCopy}>
        <Text style={styles.bundleLabel}>{bundle.label}</Text>
        {bundle.sublabel ? <Text style={styles.bundleSub}>{bundle.sublabel}</Text> : null}
      </View>
      <Text style={[styles.bundlePrice, active && styles.bundlePriceActive]}>
        {formatCurrency(bundle.amountKobo)}
      </Text>
    </Pressable>
  );
}

export const UtilityAmountPicker = memo(function UtilityAmountPicker({
  slug,
  provider,
  customerName,
  accountNumber,
  amountInput,
  selectedBundleId,
  selectedPresetKobo,
  paddingBottom,
  payLabel,
  payDisabled = false,
  onAmountInputChange,
  onSelectBundle,
  onSelectPreset,
  onClearSelection,
  onPay,
}: Props) {
  const options = getUtilityAmountOptions(slug, provider);
  const amountKobo = selectedPresetKobo ?? parseNairaInputToKobo(amountInput);
  const fixedPlan = getFixedPlanAmountKobo(provider);
  const lockAmount = fixedPlan != null && !provider.id.startsWith('static-');
  const useRowLayout =
    options.mode === 'bundles' && slug !== 'airtime' && slug !== 'electricity' && slug !== 'betting';
  const airtimeAmountError =
    slug === 'airtime' && amountKobo > 0
      ? amountKobo < AIRTIME_MANUAL_MIN_KOBO
        ? 'Minimum airtime is ₦50'
        : amountKobo > AIRTIME_MANUAL_MAX_KOBO
          ? 'Maximum airtime is ₦1,000,000'
          : null
      : null;

  const selectBundle = (bundle: PaymentBundle) => {
    void Haptics.selectionAsync();
    onSelectBundle(bundle);
  };

  const ctaLabel =
    payLabel ??
    (amountKobo > 0 ? `Pay ${formatCurrency(amountKobo)}` : 'Enter amount');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {customerName ? (
        <View style={styles.verifiedBox}>
          <CheckCircle2 size={18} color={ESO_PAY_TEXT_PRIMARY} strokeWidth={2.2} />
          <View style={styles.verifiedCopy}>
            <Text style={styles.verifiedName}>{customerName}</Text>
            <Text style={styles.verifiedMeta}>{accountNumber}</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>{options.sectionTitle}</Text>

      {useRowLayout ? (
        <View style={styles.bundleList}>
          {options.bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              active={selectedBundleId === bundle.id || lockAmount}
              variant="row"
              onPress={() => selectBundle(bundle)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.presetGrid}>
          {options.bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              active={selectedBundleId === bundle.id}
              variant="chip"
              onPress={() => selectBundle(bundle)}
            />
          ))}
        </View>
      )}

      {options.showPresetAmounts ? (
        <>
          <Text style={styles.fieldLabel}>Other amounts</Text>
          <View style={styles.presetGrid}>
            {UTILITY_AMOUNT_PRESETS_KOBO.map((kobo) => {
              const active = selectedPresetKobo === kobo && !selectedBundleId;
              return (
                <Pressable
                  key={kobo}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    onSelectPreset(kobo);
                  }}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>
                    {formatCurrency(kobo)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {!lockAmount ? (
        <>
          <Text style={styles.fieldLabel}>
            {slug === 'airtime' ? 'Or enter amount (₦50 – ₦1,000,000)' : 'Or enter amount (₦)'}
          </Text>
          <TextInput
            value={amountInput}
            onChangeText={(text) => {
              onClearSelection();
              onAmountInputChange(text);
            }}
            placeholder={slug === 'airtime' ? '50 – 1,000,000' : '0.00'}
            placeholderTextColor={ds.color.textDisabled}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          {airtimeAmountError ? (
            <Text style={styles.fieldError}>{airtimeAmountError}</Text>
          ) : null}
        </>
      ) : null}

      <GoldCTAButton
        label={ctaLabel}
        onPress={onPay}
        isDisabled={payDisabled || amountKobo <= 0 || Boolean(airtimeAmountError)}
      />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
    padding: spacing.md,
  },
  verifiedCopy: { flex: 1, gap: 2 },
  verifiedName: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  verifiedMeta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  fieldLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: ESO_PAY_TEXT_SECONDARY,
  },
  bundleList: { gap: spacing.sm },
  bundleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    padding: spacing.md,
  },
  bundleRowActive: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bundleCopy: { flex: 1, gap: 2 },
  bundleLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  bundleSub: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  bundlePrice: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  bundlePriceActive: {
    color: ESO_PAY_TEXT_PRIMARY,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  presetChipActive: {
    backgroundColor: ESO_PAY_TEXT_PRIMARY,
    borderColor: ESO_PAY_TEXT_PRIMARY,
  },
  presetText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  presetTextActive: {
    color: ESO_PAY_BG,
  },
  input: {
    fontFamily: fonts.ui,
    fontSize: 18,
    color: ESO_PAY_TEXT_PRIMARY,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  fieldError: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#FF6B6B',
  },
});
