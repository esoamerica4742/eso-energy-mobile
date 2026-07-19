import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Check, Copy, Share2 } from 'lucide-react-native';
import type { EsoPayReservedAccount } from '@/esopay/api/types';
import {
  ESO_PAY_BG,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { grid } from '@/esopay/theme/homeGrid';
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
      accessibilityRole='button'
      accessibilityLabel={`Copy ${label}`}
    >
      <View style={styles.detailCopy}>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
        {copied ? (
          <Check size={16} color={ESO_PAY_TEXT_PRIMARY} strokeWidth={2.4} />
        ) : (
          <Copy size={15} color={ESO_PAY_TEXT_SECONDARY} strokeWidth={2} />
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
        accessibilityRole='button'
        accessibilityLabel='Copy account number'
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
        accessibilityRole='button'
        accessibilityLabel='Copy account number'
      >
        {accountCopied ? <Check size={16} color={ESO_PAY_BG} strokeWidth={2.5} /> : null}
        <Text
          style={[styles.copyAccountBtnText, accountCopied && styles.copyAccountBtnTextSuccess]}
        >
          {accountCopied ? 'Copied' : 'Copy account number'}
        </Text>
      </Pressable>

      <View style={styles.bankGroup}>
        <Text style={styles.bankGroupLabel}>Transfer to</Text>
        <CopyableDetailRow
          label='Bank name'
          value={account.bank_name}
          field='bank'
          copiedField={copiedField}
          onCopy={copyValue}
        />
        <CopyableDetailRow
          label='Account name'
          value={account.account_name}
          field='name'
          copiedField={copiedField}
          onCopy={copyValue}
        />
      </View>

      <Pressable
        onPress={() => void shareDetails()}
        style={({ pressed }) => [styles.shareBtn, pressed && styles.shareBtnPressed]}
        accessibilityRole='button'
        accessibilityLabel='Share wallet details'
      >
        <Share2 size={15} color={ESO_PAY_TEXT_SECONDARY} strokeWidth={2.2} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    padding: grid.md,
    gap: grid.sm,
  },
  sectionLabel: {
    fontFamily: ds.font.title,
    fontSize: 15,
    letterSpacing: -0.1,
    color: ESO_PAY_TEXT_PRIMARY,
    marginBottom: 2,
  },
  accountLabel: {
    fontFamily: ds.font.label,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: ESO_PAY_TEXT_SECONDARY,
    marginTop: grid.xs,
  },
  accountNumberWrap: {
    paddingVertical: grid.xs,
  },
  accountNumberPressed: {
    opacity: 0.85,
  },
  accountNumber: {
    fontFamily: ds.font.display,
    fontSize: 30,
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: 2.5,
  },
  copyAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: ESO_PAY_TEXT_PRIMARY,
    marginTop: grid.xs,
  },
  copyAccountBtnSuccess: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  copyAccountBtnPressed: {
    opacity: 0.88,
  },
  copyAccountBtnText: {
    fontFamily: ds.font.bodyStrong,
    fontSize: 14,
    letterSpacing: 0.2,
    color: ESO_PAY_BG,
  },
  copyAccountBtnTextSuccess: {
    color: ESO_PAY_BG,
  },
  bankGroup: {
    marginTop: grid.sm,
    paddingTop: grid.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HOME_CARD_BORDER,
    gap: grid.sm,
  },
  bankGroupLabel: {
    fontFamily: ds.font.label,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: ESO_PAY_TEXT_SECONDARY,
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
    gap: grid.sm,
  },
  detailValue: {
    flex: 1,
    fontFamily: ds.font.bodyStrong,
    fontSize: 16,
    lineHeight: 22,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: grid.sm,
    paddingHorizontal: grid.md,
    marginTop: grid.xs,
  },
  shareBtnPressed: {
    opacity: 0.7,
  },
  shareBtnText: {
    fontFamily: ds.font.body,
    fontSize: ds.type.caption.fontSize,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  hint: {
    marginTop: grid.sm,
    fontFamily: ds.font.caption,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.color.textMuted,
    textAlign: 'center',
  },
});
