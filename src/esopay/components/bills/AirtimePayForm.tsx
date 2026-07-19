import { memo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'phosphor-react-native';
import type { EsoPayBeneficiary } from '@/esopay/storage/beneficiaries';
import type { CategoryBillerEntry } from '@/esopay/lib/buildCategoryBillPayCards';
import { AIRTIME_OPAY_AMOUNTS_KOBO } from '@/esopay/lib/telecomNetworks';
import { TelecomPhoneRow } from '@/esopay/components/bills/TelecomPhoneRow';
import { UtilityPayEntrance } from '@/esopay/components/bills/UtilityPayEntrance';
import {
  AIRTIME_MANUAL_MAX_KOBO,
  AIRTIME_MANUAL_MIN_KOBO,
} from '@/esopay/data/bundles';
import { utilityPayChrome as chrome } from '@/esopay/theme/utilityPayChrome';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrencyCompact, parseNairaInputToKobo } from '@/esopay/utils/currency';

type Props = {
  network: CategoryBillerEntry;
  networks: CategoryBillerEntry[];
  phone: string;
  amountInput: string;
  selectedPresetKobo: number | null;
  validationError: string | null;
  beneficiaries: EsoPayBeneficiary[];
  payLabel?: string;
  payDisabled?: boolean;
  paddingBottom: number;
  onSelectNetwork: (entry: CategoryBillerEntry) => void;
  onPhoneChange: (digits: string) => void;
  onSelectBeneficiary: (item: EsoPayBeneficiary) => void;
  onSelectPreset: (kobo: number) => void;
  onAmountInputChange: (value: string) => void;
  onClearPreset: () => void;
  onPay: () => void;
};

export const AirtimePayForm = memo(function AirtimePayForm({
  network,
  networks,
  phone,
  amountInput,
  selectedPresetKobo,
  validationError,
  beneficiaries,
  payLabel = 'Pay',
  payDisabled = false,
  paddingBottom,
  onSelectNetwork,
  onPhoneChange,
  onSelectBeneficiary,
  onSelectPreset,
  onAmountInputChange,
  onClearPreset,
  onPay,
}: Props) {
  const amountKobo = selectedPresetKobo ?? parseNairaInputToKobo(amountInput);
  const amountError =
    amountKobo > 0
      ? amountKobo < AIRTIME_MANUAL_MIN_KOBO
        ? 'Minimum airtime is ₦50'
        : amountKobo > AIRTIME_MANUAL_MAX_KOBO
          ? 'Maximum airtime is ₦1,000,000'
          : null
      : null;
  const phoneReady = phone.trim().length >= 10;
  const canPay = !payDisabled && amountKobo > 0 && phoneReady && !amountError;
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
          <Text style={chrome.sectionTitle}>Top up</Text>
          <View style={styles.amountGrid}>
            {AIRTIME_OPAY_AMOUNTS_KOBO.map((kobo) => {
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
                    pressed && styles.tilePressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
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

          <View style={styles.customBlock}>
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
                  placeholder="50 – 1,000,000"
                  placeholderTextColor="rgba(255,255,255,0.28)"
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
          </View>

          {amountError || validationError ? (
            <Text style={chrome.error}>{amountError ?? validationError}</Text>
          ) : null}
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
  tilePressed: { opacity: 0.9 },
  customBlock: { gap: 10, marginTop: 2 },
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
});
