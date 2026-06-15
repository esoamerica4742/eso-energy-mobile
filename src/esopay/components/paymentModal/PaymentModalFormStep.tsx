import { ActivityIndicator, Pressable, Switch, Text, TextInput, View } from 'react-native';
import type { PaymentBundle } from '@/esopay/data/bundles';
import type { PaymentModalTarget } from '@/esopay/components/paymentModal/types';
import { paymentModalStyles as styles } from '@/esopay/components/paymentModal/styles';
import { BeneficiaryChips } from '@/esopay/components/BeneficiaryChips';
import { EsoPayPrimaryButton } from '@/esopay/components/EsoPayButtons';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';
import { Skeleton } from '@/esopay/components/Skeleton';
import type { EsoPayBeneficiary } from '@/esopay/storage/beneficiaries';
import { isMonnifyAccountReady } from '@/esopay/services/monnify';
import { colors } from '@/esopay/theme/colors';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  target: PaymentModalTarget | null;
  beneficiaries: EsoPayBeneficiary[];
  accountNumber: string;
  onAccountNumberChange: (value: string) => void;
  onBeneficiarySelect: (beneficiary: EsoPayBeneficiary) => void;
  isValidating: boolean;
  customerName: string | null;
  validationError: string | null;
  paymentBundles: PaymentBundle[] | null;
  selectedBundleId: string | null;
  onSelectBundle: (bundle: PaymentBundle) => void;
  amountInput: string;
  onAmountInputChange: (value: string) => void;
  walletBalance: number;
  insufficientFunds: boolean;
  fundsNeededKobo: number;
  onAddFunds: () => void;
  saveBeneficiary: boolean;
  onSaveBeneficiaryChange: (value: boolean) => void;
  canPayRole: boolean;
  amountKobo: number;
  onContinue: () => void;
};

export function PaymentModalFormStep({
  target,
  beneficiaries,
  accountNumber,
  onAccountNumberChange,
  onBeneficiarySelect,
  isValidating,
  customerName,
  validationError,
  paymentBundles,
  selectedBundleId,
  onSelectBundle,
  amountInput,
  onAmountInputChange,
  walletBalance,
  insufficientFunds,
  fundsNeededKobo,
  onAddFunds,
  saveBeneficiary,
  onSaveBeneficiaryChange,
  canPayRole,
  amountKobo,
  onContinue,
}: Props) {
  return (
    <>
      <BeneficiaryChips
        beneficiaries={beneficiaries}
        onSelect={onBeneficiarySelect}
        selectedAccountNumber={accountNumber.trim()}
      />

      <Text style={[styles.fieldLabel, styles.fieldGap]}>Meter / account number</Text>
      <TextInput
        value={accountNumber}
        onChangeText={onAccountNumberChange}
        placeholder="Enter smart meter or account number"
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
        style={styles.input}
      />

      {isValidating && isMonnifyAccountReady(accountNumber) ? (
        <View style={styles.lookupRow}>
          <Skeleton height={14} width="55%" />
          <ActivityIndicator color={colors.gold} size="small" />
        </View>
      ) : customerName ? (
        <Text style={styles.customerName}>{customerName}</Text>
      ) : validationError ? (
        <Text style={styles.validationError}>{validationError}</Text>
      ) : null}

      {paymentBundles && paymentBundles.length > 0 ? (
        <>
          <Text style={[styles.fieldLabel, styles.fieldGap]}>
            {target?.provider.category === 'airtime' ? 'Quick amounts' : 'Select plan'}
          </Text>
          <View style={styles.bundleGrid}>
            {paymentBundles.map((bundle) => {
              const active = selectedBundleId === bundle.id;
              return (
                <Pressable
                  key={bundle.id}
                  onPress={() => onSelectBundle(bundle)}
                  style={[styles.bundleChip, active && styles.bundleChipActive]}
                >
                  <Text style={[styles.bundleLabel, active && styles.bundleLabelActive]}>
                    {bundle.label}
                  </Text>
                  {bundle.sublabel ? (
                    <Text style={styles.bundleSub}>{bundle.sublabel}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Text style={[styles.fieldLabel, styles.fieldGap]}>Amount</Text>
      <View style={styles.amountRow}>
        <Text style={styles.nairaPrefix}>₦</Text>
        <TextInput
          value={amountInput}
          onChangeText={onAmountInputChange}
          placeholder="0.00"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
          style={styles.amountInput}
        />
      </View>

      <Text style={[styles.walletHint, insufficientFunds && styles.walletHintWarn]}>
        Wallet balance: {formatCurrency(walletBalance)}
      </Text>

      {insufficientFunds ? (
        <>
          <Text style={styles.walletWarn}>
            You need {formatCurrency(fundsNeededKobo)} more to complete this payment.
          </Text>
          <GoldCTAButton label="Add funds" onPress={onAddFunds} style={styles.addFundsBtn} />
        </>
      ) : null}

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Save beneficiary</Text>
        <Switch
          value={saveBeneficiary}
          onValueChange={onSaveBeneficiaryChange}
          trackColor={{ false: colors.surface2, true: colors.goldGlow }}
          thumbColor={saveBeneficiary ? colors.gold : colors.muted}
        />
      </View>

      {!canPayRole ? (
        <Text style={styles.rbacHint}>
          Your role cannot initiate payments. Contact an account owner.
        </Text>
      ) : null}

      <EsoPayPrimaryButton
        label={amountKobo > 0 ? `Continue · ${formatCurrency(amountKobo)}` : 'Continue'}
        onPress={onContinue}
        disabled={!canPayRole || !customerName || amountKobo <= 0 || insufficientFunds}
        style={styles.payBtn}
      />

      <Text style={styles.disclaimer}>
        Debited from your Monnify wallet via server-side bill payment. No card data is stored on
        this device.
      </Text>
    </>
  );
}
