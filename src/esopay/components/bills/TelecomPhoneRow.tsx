import { memo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CaretDown, Check, User, X } from 'phosphor-react-native';
import type { EsoPayBeneficiary } from '@/esopay/storage/beneficiaries';
import type { CategoryBillerEntry } from '@/esopay/lib/buildCategoryBillPayCards';
import { formatPhoneDisplay, phoneDigits } from '@/esopay/lib/telecomNetworks';
import { getBillerBrandStyle } from '@/esopay/data/billerBrands';
import { BillerBrandMark } from '@/esopay/components/bills/BillerBrandMark';
import { ESO_PAY_TEXT_PRIMARY, ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { utilityPayChrome as chrome } from '@/esopay/theme/utilityPayChrome';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  network: CategoryBillerEntry;
  networks: CategoryBillerEntry[];
  phone: string;
  beneficiaries: EsoPayBeneficiary[];
  onSelectNetwork: (entry: CategoryBillerEntry) => void;
  onPhoneChange: (digits: string) => void;
  onSelectBeneficiary: (item: EsoPayBeneficiary) => void;
  autoFocus?: boolean;
};

export const TelecomPhoneRow = memo(function TelecomPhoneRow({
  network,
  networks,
  phone,
  beneficiaries,
  onSelectNetwork,
  onPhoneChange,
  onSelectBeneficiary,
  autoFocus = true,
}: Props) {
  const [networkOpen, setNetworkOpen] = useState(false);
  const [beneficiariesOpen, setBeneficiariesOpen] = useState(false);
  const brand = getBillerBrandStyle(network.provider);

  return (
    <>
      <View style={styles.shell}>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            setNetworkOpen(true);
          }}
          style={({ pressed }) => [styles.networkBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Network ${network.meta.shortLabel}`}
        >
          <BillerBrandMark brand={brand} size="md" />
          <CaretDown size={12} color="rgba(255,255,255,0.4)" weight="bold" />
        </Pressable>

        <TextInput
          value={formatPhoneDisplay(phone)}
          onChangeText={(text) => onPhoneChange(phoneDigits(text))}
          placeholder="080X XXX XXXX"
          placeholderTextColor="rgba(255,255,255,0.28)"
          keyboardType="phone-pad"
          style={styles.phoneInput}
          autoFocus={autoFocus}
          maxLength={13}
        />

        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            setBeneficiariesOpen(true);
          }}
          style={({ pressed }) => [styles.contactBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Beneficiaries"
        >
          <User size={18} color="#0A0A0A" weight="fill" />
        </Pressable>
      </View>

      <Modal
        visible={networkOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setNetworkOpen(false)}
      >
        <View style={chrome.sheetBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setNetworkOpen(false)}
          />
          <View style={chrome.sheet}>
            <View style={chrome.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select network</Text>
              <Pressable onPress={() => setNetworkOpen(false)} hitSlop={10}>
                <X size={20} color={ESO_PAY_TEXT_SECONDARY} weight="bold" />
              </Pressable>
            </View>
            {networks.map((item) => {
              const itemBrand = getBillerBrandStyle(item.provider);
              const active = item.meta.id === network.meta.id;
              return (
                <Pressable
                  key={item.meta.id}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    onSelectNetwork(item);
                    setNetworkOpen(false);
                  }}
                  style={[styles.sheetRow, active && styles.sheetRowActive]}
                >
                  <BillerBrandMark brand={itemBrand} size="sm" />
                  <Text style={styles.sheetRowTitle}>{item.meta.shortLabel}</Text>
                  {active ? <Check size={18} color={ESO_PAY_TEXT_PRIMARY} weight="bold" /> : null}
                </Pressable>
              );
            })}
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
          />
          <View style={chrome.sheet}>
            <View style={chrome.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Beneficiaries</Text>
              <Pressable onPress={() => setBeneficiariesOpen(false)} hitSlop={10}>
                <X size={20} color={ESO_PAY_TEXT_SECONDARY} weight="bold" />
              </Pressable>
            </View>
            {beneficiaries.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No saved numbers yet</Text>
                <Text style={styles.emptyBody}>
                  Numbers you pay often can be saved for faster top-ups.
                </Text>
              </View>
            ) : (
              beneficiaries.map((item) => {
                const selected = phoneDigits(phone) === phoneDigits(item.accountNumber);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      onSelectBeneficiary(item);
                      setBeneficiariesOpen(false);
                    }}
                    style={[styles.sheetRow, selected && styles.sheetRowActive]}
                  >
                    <View style={styles.sheetRowCopy}>
                      <Text style={styles.sheetRowTitle} numberOfLines={1}>
                        {item.customerName ?? formatPhoneDisplay(item.accountNumber)}
                      </Text>
                      <Text style={styles.sheetRowMeta}>
                        {formatPhoneDisplay(item.accountNumber)}
                      </Text>
                    </View>
                    {selected ? (
                      <Check size={18} color={ESO_PAY_TEXT_PRIMARY} weight="bold" />
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pressed: { opacity: 0.88 },
  networkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneInput: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 23,
    lineHeight: 28,
    letterSpacing: 0.8,
    color: ESO_PAY_TEXT_PRIMARY,
    paddingVertical: 8,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  contactBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
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
    letterSpacing: -0.25,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sheetRowActive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sheetRowCopy: { flex: 1, minWidth: 0, gap: 3 },
  sheetRowTitle: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    letterSpacing: -0.15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  sheetRowMeta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  emptyBody: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.42)',
  },
});
