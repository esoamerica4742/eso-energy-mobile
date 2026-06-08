import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Check, Copy, Share2 } from 'lucide-react-native';
import type { EsoPayReservedAccount } from '@/esopay/api/types';
import { colors } from '@/esopay/theme/colors';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import { fonts } from '@/theme/fonts';
import { useEnodeToast } from '@/providers/EnodeToastProvider';

type CopyField = 'account' | 'bank' | 'name';

type Props = {
  account: EsoPayReservedAccount;
};

function buildShareMessage(account: EsoPayReservedAccount): string {
  return [
    'Eso Wallet Details:',
    `Bank: ${account.bank_name}`,
    `Account Number: ${account.account_number}`,
    `Account Name: ${account.account_name}`,
  ].join('\n');
}

type DetailRowProps = {
  label: string;
  value: string;
  field: CopyField;
  copiedField: CopyField | null;
  onCopy: (field: CopyField, value: string, toastMessage: string) => void;
};

const CopyableDetailRow = memo(function CopyableDetailRow({
  label,
  value,
  field,
  copiedField,
  onCopy,
}: DetailRowProps) {
  const copied = copiedField === field;

  return (
    <Pressable
      onPress={() => onCopy(field, value, `${label} copied!`)}
      style={({ pressed }) => [styles.detailRow, pressed && styles.detailRowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Copy ${label}`}
    >
      <View style={styles.detailCopy}>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
        {copied ? (
          <Check size={16} color={colors.success} strokeWidth={2.4} />
        ) : (
          <Copy size={15} color="rgba(255,255,255,0.55)" strokeWidth={2} />
        )}
      </View>
    </Pressable>
  );
});

export const FundWalletAccountCard = memo(function FundWalletAccountCard({ account }: Props) {
  const toast = useEnodeToast();
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const [accountCopied, setAccountCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopyFeedback = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setCopiedField(null);
      setAccountCopied(false);
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const copyValue = useCallback(
    async (field: CopyField, value: string, toastMessage: string) => {
      await Clipboard.setStringAsync(value);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopiedField(field);
      if (field === 'account') setAccountCopied(true);
      clearCopyFeedback();
      toast.show(toastMessage, 'success');
    },
    [clearCopyFeedback, toast],
  );

  const copyAccountNumber = useCallback(() => {
    void copyValue('account', account.account_number, 'Account number copied!');
  }, [account.account_number, copyValue]);

  const shareDetails = useCallback(async () => {
    try {
      await Share.share({ message: buildShareMessage(account) });
    } catch {
      // User dismissed share sheet.
    }
  }, [account]);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Account details</Text>

      <Text style={styles.accountLabel}>Account number</Text>
      <Pressable
        onPress={copyAccountNumber}
        accessibilityRole="button"
        accessibilityLabel="Copy account number"
        style={({ pressed }) => [styles.accountNumberWrap, pressed && styles.accountNumberPressed]}
      >
        <Text style={styles.accountNumber}>{account.account_number}</Text>
      </Pressable>

      <Pressable
        onPress={copyAccountNumber}
        style={({ pressed }) => [
          styles.copyAccountBtn,
          accountCopied && styles.copyAccountBtnSuccess,
          pressed && styles.copyAccountBtnPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Copy account number"
      >
        {accountCopied ? (
          <Check size={16} color={colors.success} strokeWidth={2.5} />
        ) : null}
        <Text style={[styles.copyAccountBtnText, accountCopied && styles.copyAccountBtnTextSuccess]}>
          {accountCopied ? 'Copied' : 'Copy account number'}
        </Text>
      </Pressable>

      <View style={styles.bankGroup}>
        <Text style={styles.bankGroupLabel}>Transfer to</Text>
        <CopyableDetailRow
          label="Bank name"
          value={account.bank_name}
          field="bank"
          copiedField={copiedField}
          onCopy={copyValue}
        />
        <CopyableDetailRow
          label="Account name"
          value={account.account_name}
          field="name"
          copiedField={copiedField}
          onCopy={copyValue}
        />
      </View>

      <Pressable
        onPress={() => void shareDetails()}
        style={({ pressed }) => [styles.shareBtn, pressed && styles.shareBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Share wallet details"
      >
        <Share2 size={15} color={colors.muted} strokeWidth={2.2} />
        <Text style={styles.shareBtnText}>Share details</Text>
      </Pressable>

      <Text style={styles.hint}>
        Payments are credited automatically within a few minutes. Pull to refresh your balance after
        transferring.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: T.spacing.lg,
    gap: T.spacing.sm,
  },
  sectionLabel: {
    fontFamily: esopayFonts.label,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 2,
  },
  accountLabel: {
    fontFamily: esopayFonts.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: T.spacing.xs,
  },
  accountNumberWrap: {
    paddingVertical: T.spacing.xs,
  },
  accountNumberPressed: {
    opacity: 0.85,
  },
  accountNumber: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.white,
    letterSpacing: 2.5,
  },
  copyAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    paddingVertical: T.spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: `${T.color.gold.primary}12`,
    marginTop: T.spacing.xs,
  },
  copyAccountBtnSuccess: {
    borderColor: colors.limeBorder,
    backgroundColor: colors.limePillBg,
  },
  copyAccountBtnPressed: {
    opacity: 0.88,
  },
  copyAccountBtnText: {
    fontFamily: esopayFonts.subheading,
    fontSize: T.type.label.size,
    letterSpacing: 0.5,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  copyAccountBtnTextSuccess: {
    color: colors.success,
    textTransform: 'none',
    letterSpacing: 0.2,
  },
  bankGroup: {
    marginTop: T.spacing.md,
    paddingTop: T.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.color.border.subtle,
    gap: T.spacing.sm,
  },
  bankGroupLabel: {
    fontFamily: esopayFonts.label,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 2,
  },
  detailRow: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  detailRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  detailCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: T.spacing.md,
  },
  detailValue: {
    flex: 1,
    fontFamily: esopayFonts.subheading,
    fontSize: 16,
    lineHeight: 22,
    color: '#E8EAED',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: T.spacing.sm,
    paddingHorizontal: T.spacing.md,
    marginTop: T.spacing.xs,
  },
  shareBtnPressed: {
    opacity: 0.7,
  },
  shareBtnText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    color: colors.muted,
  },
  hint: {
    marginTop: T.spacing.sm,
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    lineHeight: T.type.caption.lineHeight,
    color: colors.muted,
    textAlign: 'center',
  },
});
