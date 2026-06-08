import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle2 } from 'lucide-react-native';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';
import {
  getUtilityAmountOptions,
  type PaymentBundle,
} from '@/esopay/data/bundles';
import { UTILITY_AMOUNT_PRESETS_KOBO } from '@/esopay/data/nigeriaBillers';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import type { UtilityProvider } from '@/esopay/api/types';
import { luxury } from '@/esopay/theme/luxury';
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
  onAmountInputChange,
  onSelectBundle,
  onSelectPreset,
  onClearSelection,
  onPay,
}: Props) {
  const options = getUtilityAmountOptions(slug, provider);
  const amountKobo = selectedPresetKobo ?? parseNairaInputToKobo(amountInput);
  const useRowLayout = options.mode === 'bundles' && slug !== 'airtime' && slug !== 'electricity' && slug !== 'betting';

  const selectBundle = (bundle: PaymentBundle) => {
    void Haptics.selectionAsync();
    onSelectBundle(bundle);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {customerName ? (
        <View style={styles.verifiedBox}>
          <CheckCircle2 size={18} color={luxury.green} strokeWidth={2.2} />
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
              active={selectedBundleId === bundle.id}
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

      <Text style={styles.fieldLabel}>Or enter amount (₦)</Text>
      <TextInput
        value={amountInput}
        onChangeText={(text) => {
          onClearSelection();
          onAmountInputChange(text);
        }}
        placeholder="0.00"
        placeholderTextColor={luxury.textDim}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <GoldCTAButton
        label={amountKobo > 0 ? `Pay ${formatCurrency(amountKobo)}` : 'Enter amount'}
        onPress={onPay}
        isDisabled={amountKobo <= 0}
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
    color: luxury.textPrimary,
  },
  verifiedMeta: {
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
  bundleList: { gap: spacing.sm },
  bundleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: luxury.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    padding: spacing.md,
  },
  bundleRowActive: {
    borderColor: luxury.gold,
    backgroundColor: luxury.goldDim,
  },
  bundleCopy: { flex: 1, gap: 2 },
  bundleLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: luxury.textPrimary,
  },
  bundleSub: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: luxury.textMuted,
  },
  bundlePrice: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: luxury.gold,
  },
  bundlePriceActive: {
    color: luxury.textPrimary,
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
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    backgroundColor: luxury.surface,
  },
  presetChipActive: {
    backgroundColor: luxury.gold,
    borderColor: luxury.gold,
  },
  presetText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: luxury.textPrimary,
  },
  presetTextActive: {
    color: '#1A1200',
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
});
