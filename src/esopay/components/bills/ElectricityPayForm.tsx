import { memo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CaretRight, Check, X } from 'phosphor-react-native';
import type { EsoPayBeneficiary } from '@/esopay/storage/beneficiaries';
import { getDiscoBrandStyle } from '@/esopay/data/billerBrands';
import { BillerBrandMark } from '@/esopay/components/bills/BillerBrandMark';
import { UtilityPayEntrance } from '@/esopay/components/bills/UtilityPayEntrance';
import {
  ELECTRICITY_AMOUNT_PRESETS_KOBO,
  type ElectricityCompanyGroup,
  type ElectricityMeterType,
} from '@/esopay/lib/electricityCompanies';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { utilityPayChrome as chrome } from '@/esopay/theme/utilityPayChrome';
import { ds } from '@/esopay/theme/designSystem';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrencyCompact, parseNairaInputToKobo } from '@/esopay/utils/currency';

type Props = {
  company: ElectricityCompanyGroup;
  companies: ElectricityCompanyGroup[];
  meterType: ElectricityMeterType;
  accountNumber: string;
  amountInput: string;
  selectedPresetKobo: number | null;
  customerName: string | null;
  validationError: string | null;
  beneficiaries: EsoPayBeneficiary[];
  payLabel?: string;
  payDisabled?: boolean;
  paddingBottom: number;
  onSelectCompany: (company: ElectricityCompanyGroup) => void;
  onMeterTypeChange: (meter: ElectricityMeterType) => void;
  onAccountNumberChange: (value: string) => void;
  onSelectBeneficiary: (item: EsoPayBeneficiary) => void;
  onSelectPreset: (kobo: number) => void;
  onAmountInputChange: (value: string) => void;
  onClearPreset: () => void;
  onPay: () => void;
};

export const ElectricityPayForm = memo(function ElectricityPayForm({
  company,
  companies,
  meterType,
  accountNumber,
  amountInput,
  selectedPresetKobo,
  customerName,
  validationError,
  beneficiaries,
  payLabel = 'Pay',
  payDisabled = false,
  paddingBottom,
  onSelectCompany,
  onMeterTypeChange,
  onAccountNumberChange,
  onSelectBeneficiary,
  onSelectPreset,
  onAmountInputChange,
  onClearPreset,
  onPay,
}: Props) {
  const [beneficiariesOpen, setBeneficiariesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const brand = getDiscoBrandStyle(company.brandMeta);
  const amountKobo = selectedPresetKobo ?? parseNairaInputToKobo(amountInput);
  const meterReady = accountNumber.trim().length >= 6;
  const canPay = !payDisabled && amountKobo > 0 && meterReady;
  const hasPrepaid = Boolean(company.prepaid);
  const hasPostpaid = Boolean(company.postpaid);
  const meterHint =
    accountNumber.length > 0 && accountNumber.length < 6
      ? 'Enter a valid meter / account number'
      : null;
  const payHint =
    meterReady && amountKobo <= 0
      ? 'Select or enter an amount to continue'
      : !meterReady && amountKobo > 0
        ? 'Enter the meter number to pay'
        : null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[chrome.screenPad, { paddingBottom }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <UtilityPayEntrance index={0}>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            setCompanyOpen(true);
          }}
          style={({ pressed }) => [styles.providerShell, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Electricity company ${company.title}. Change company`}
        >
          <BillerBrandMark brand={brand} size="lg" />
          <View style={styles.providerCopy}>
            <Text style={styles.providerName} numberOfLines={1}>
              {company.title}
            </Text>
            <Text style={styles.providerMeta} numberOfLines={1}>
              Change electricity company
            </Text>
          </View>
          <CaretRight size={16} color="rgba(255,255,255,0.4)" weight="bold" />
        </Pressable>
      </UtilityPayEntrance>

      {hasPrepaid || hasPostpaid ? (
        <UtilityPayEntrance index={1}>
          <View style={styles.segment}>
            {hasPrepaid ? (
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  onMeterTypeChange('prepaid');
                }}
                style={[styles.segmentItem, meterType === 'prepaid' && styles.segmentItemActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: meterType === 'prepaid' }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    meterType === 'prepaid' && styles.segmentTextActive,
                  ]}
                >
                  Prepaid
                </Text>
              </Pressable>
            ) : null}
            {hasPostpaid ? (
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  onMeterTypeChange('postpaid');
                }}
                style={[styles.segmentItem, meterType === 'postpaid' && styles.segmentItemActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: meterType === 'postpaid' }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    meterType === 'postpaid' && styles.segmentTextActive,
                  ]}
                >
                  Postpaid
                </Text>
              </Pressable>
            ) : null}
          </View>
        </UtilityPayEntrance>
      ) : null}

      <UtilityPayEntrance index={2}>
      <View style={[chrome.surface, chrome.surfacePad]}>
        <View style={styles.fieldHeader}>
          <Text style={chrome.fieldLabel}>Meter / account number</Text>
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              setBeneficiariesOpen(true);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Beneficiaries"
          >
            <Text style={chrome.link}>Beneficiaries</Text>
          </Pressable>
        </View>
        <TextInput
          value={accountNumber}
          onChangeText={onAccountNumberChange}
          placeholder="Enter meter number"
          placeholderTextColor={ds.color.textDisabled}
          keyboardType="number-pad"
          style={styles.meterInput}
          autoFocus
        />
        {customerName ? <Text style={styles.customerName}>{customerName}</Text> : null}
        {validationError ? (
          <Text style={chrome.error}>{validationError}</Text>
        ) : meterHint ? (
          <Text style={styles.hint}>{meterHint}</Text>
        ) : null}

        <Text style={[chrome.sectionTitle, styles.amountTitle]}>Amount</Text>
        <View style={styles.amountGrid}>
          {ELECTRICITY_AMOUNT_PRESETS_KOBO.map((kobo) => {
            const active = selectedPresetKobo === kobo;
            const label = formatCurrencyCompact(kobo);
            return (
              <Pressable
                key={kobo}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onSelectPreset(kobo);
                }}
                style={({ pressed }) => [
                  chrome.tile,
                  styles.amountTile,
                  active && chrome.tileActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={label}
              >
                {active ? (
                  <View style={chrome.tileCheck}>
                    <Check size={11} color="#0A0A0A" weight="bold" />
                  </View>
                ) : null}
                <Text style={chrome.amountValue}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={chrome.fieldLabel}>Custom amount</Text>
        <View style={styles.amountPayRow}>
          <View style={chrome.inputShell}>
            <Text style={styles.nairaPrefix}>₦</Text>
            <TextInput
              value={amountInput}
              onChangeText={(text) => {
                onClearPreset();
                onAmountInputChange(text);
              }}
              placeholder="Enter amount"
              placeholderTextColor={ds.color.textDisabled}
              keyboardType="decimal-pad"
              style={styles.customAmountInput}
            />
          </View>
          <Pressable
            onPress={onPay}
            disabled={!canPay}
            style={[chrome.payPill, !canPay && chrome.payPillDisabled]}
            accessibilityRole="button"
            accessibilityLabel={payLabel}
          >
            <Text style={[chrome.payPillText, !canPay && chrome.payPillTextDisabled]}>
              {payLabel}
            </Text>
          </Pressable>
        </View>
        {!validationError && payHint ? <Text style={styles.hint}>{payHint}</Text> : null}
      </View>
      </UtilityPayEntrance>

      <Modal
        visible={companyOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCompanyOpen(false)}
      >
        <View style={chrome.sheetBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCompanyOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={chrome.sheet}>
            <View style={chrome.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select electricity company</Text>
              <Pressable
                onPress={() => setCompanyOpen(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={20} color={ESO_PAY_TEXT_SECONDARY} weight="bold" />
              </Pressable>
            </View>
            <ScrollView
              style={styles.sheetList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {companies.map((item) => {
                const itemBrand = getDiscoBrandStyle(item.brandMeta);
                const active = item.id === company.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      onSelectCompany(item);
                      setCompanyOpen(false);
                    }}
                    style={[styles.sheetRow, active && styles.sheetRowSelected]}
                  >
                    <BillerBrandMark brand={itemBrand} size="sm" />
                    <View style={styles.sheetRowCopy}>
                      <Text style={styles.sheetRowTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.sheetRowMeta} numberOfLines={1}>
                        {item.stateLabel}
                      </Text>
                    </View>
                    {active ? (
                      <Check size={18} color={ESO_PAY_TEXT_PRIMARY} weight="bold" />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={beneficiariesOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setBeneficiariesOpen(false)}
      >
        <View style={chrome.sheetBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setBeneficiariesOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={chrome.sheet}>
            <View style={chrome.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Beneficiaries</Text>
              <Pressable
                onPress={() => setBeneficiariesOpen(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={20} color={ESO_PAY_TEXT_SECONDARY} weight="bold" />
              </Pressable>
            </View>
            {beneficiaries.length === 0 ? (
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetEmptyTitle}>No saved meters yet</Text>
                <Text style={styles.sheetEmptyBody}>
                  Successful payments can be saved here for one-tap refill.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.sheetList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {beneficiaries.map((item) => {
                  const selected = accountNumber.trim() === item.accountNumber;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        onSelectBeneficiary(item);
                        setBeneficiariesOpen(false);
                      }}
                      style={[styles.sheetRow, selected && styles.sheetRowSelected]}
                    >
                      <View style={styles.sheetRowCopy}>
                        <Text style={styles.sheetRowTitle} numberOfLines={1}>
                          {item.customerName ?? item.accountNumber}
                        </Text>
                        <Text style={styles.sheetRowMeta} numberOfLines={1}>
                          {item.accountNumber}
                          {item.providerName ? ` · ${item.providerName}` : ''}
                        </Text>
                      </View>
                      {selected ? (
                        <Check size={18} color={ESO_PAY_TEXT_PRIMARY} weight="bold" />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  pressed: { opacity: 0.88 },
  providerShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  providerCopy: { flex: 1, minWidth: 0, gap: 3 },
  providerName: {
    fontFamily: fonts.uiMedium,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.35,
    color: ESO_PAY_TEXT_PRIMARY,
    includeFontPadding: false,
  },
  providerMeta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    letterSpacing: 0.1,
    color: 'rgba(255,255,255,0.38)',
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  segmentText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    letterSpacing: -0.15,
    color: 'rgba(255,255,255,0.42)',
  },
  segmentTextActive: {
    fontFamily: fonts.uiBold,
    color: '#0A0A0A',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meterInput: {
    fontFamily: fonts.uiMedium,
    fontSize: 19,
    letterSpacing: 0.4,
    color: ESO_PAY_TEXT_PRIMARY,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontVariant: ['tabular-nums'],
  },
  customerName: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  hint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.38)',
  },
  amountTitle: {
    marginTop: 6,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  amountTile: {
    paddingVertical: 22,
    paddingHorizontal: 6,
    minHeight: 76,
  },
  amountPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nairaPrefix: {
    fontFamily: fonts.uiBold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: 'rgba(255,255,255,0.5)',
  },
  customAmountInput: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 20,
    letterSpacing: -0.35,
    color: '#FFFFFF',
    paddingVertical: 14,
    fontVariant: ['tabular-nums'],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 17,
    letterSpacing: -0.2,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  sheetEmpty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: 8,
  },
  sheetEmptyTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  sheetEmptyBody: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.48)',
  },
  sheetList: {
    paddingHorizontal: spacing.lg,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sheetRowSelected: {
    opacity: 1,
  },
  sheetRowCopy: { flex: 1, minWidth: 0, gap: 3 },
  sheetRowTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    letterSpacing: -0.1,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  sheetRowMeta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
});
