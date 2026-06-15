import { memo, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Check, Copy } from 'lucide-react-native';
import { formatPrepaidTokenDisplay } from '@/esopay/lib/prepaidTokenFormat';
import { colors } from '@/esopay/theme/colors';
import { esopayFonts } from '@/esopay/theme/fonts';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency } from '@/esopay/utils/currency';
import { useEnodeToast } from '@/providers/EnodeToastProvider';

type Props = {
  token: string;
  tokenFormatted?: string | null;
  meterName?: string | null;
  amountKobo?: number;
};

export const PrepaidTokenDeliveryCard = memo(function PrepaidTokenDeliveryCard({
  token,
  tokenFormatted,
  meterName,
  amountKobo,
}: Props) {
  const toast = useEnodeToast();
  const display = tokenFormatted?.trim() || formatPrepaidTokenDisplay(token);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyToken = useCallback(async () => {
    const raw = display.replace(/-/g, '');
    await Clipboard.setStringAsync(raw);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    toast.show('Token copied!', 'success');
  }, [display, toast]);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Your prepaid power token</Text>
      {meterName ? (
        <Text style={styles.meterName} numberOfLines={2}>
          {meterName}
        </Text>
      ) : null}
      <Text style={styles.token} selectable>
        {display}
      </Text>
      {amountKobo != null && amountKobo > 0 ? (
        <Text style={styles.amount}>Amount: {formatCurrency(amountKobo)}</Text>
      ) : null}
      <Pressable
        onPress={() => void copyToken()}
        style={({ pressed }) => [
          styles.copyBtn,
          copied && styles.copyBtnSuccess,
          pressed && styles.copyBtnPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Copy token"
      >
        {copied ? (
          <Check size={18} color={colors.success} strokeWidth={2.5} />
        ) : (
          <Copy size={18} color={colors.gold} strokeWidth={2.2} />
        )}
        <Text style={[styles.copyBtnText, copied && styles.copyBtnTextSuccess]}>
          {copied ? 'Copied' : 'Copy token'}
        </Text>
      </Pressable>
      <Text style={styles.hint}>
        We will also send this to your phone when push or SMS delivery is enabled.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: 'rgba(212, 160, 23, 0.08)',
    padding: 16,
    gap: 10,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: esopayFonts.label,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  meterName: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#E8EAED',
    textAlign: 'center',
  },
  token: {
    fontFamily: fonts.uiMedium,
    fontWeight: '700',
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: 2,
    color: colors.white,
    textAlign: 'center',
  },
  amount: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.muted,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: 'rgba(212, 160, 23, 0.12)',
    marginTop: 4,
  },
  copyBtnSuccess: {
    borderColor: colors.limeBorder,
    backgroundColor: colors.limePillBg,
  },
  copyBtnPressed: {
    opacity: 0.88,
  },
  copyBtnText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  copyBtnTextSuccess: {
    color: colors.success,
  },
  hint: {
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
    textAlign: 'center',
  },
});
