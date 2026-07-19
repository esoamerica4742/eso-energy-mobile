import { memo, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { RotateCcw } from 'lucide-react-native';
import { useRecentUtilityPayments } from '@/esopay/api/hooks/useBilling';
import type { RecentUtilityPayment } from '@/esopay/api/types';
import { getBillerBrandStyle } from '@/esopay/data/billerBrands';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { Skeleton } from '@/esopay/components/Skeleton';
import {
  ESO_PAY_BG,
  ESO_PAY_GOLD,
  ESO_PAY_GOLD_MUTED,
  ESO_PAY_GOLD_MUTED_06,
  ESO_PAY_SURFACE,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
  HOME_CARD_SURFACE,
  TEAL_ACCENT,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency } from '@/esopay/utils/currency';

function PayAgainChip({
  payment,
  onRepeat,
}: {
  payment: RecentUtilityPayment;
  onRepeat: (payment: RecentUtilityPayment) => void;
}) {
  const brand = getBillerBrandStyle(payment.provider);
  let dateLabel = 'Recent';
  try {
    dateLabel = format(parseISO(payment.paid_at), 'd MMM');
  } catch {
    // keep fallback
  }

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onRepeat(payment);
      }}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Pay again ${payment.provider.name}`}
    >
      <View style={[styles.logo, { backgroundColor: brand.logoBg }]}>
        <Text style={[styles.logoText, { color: brand.logoFg }]}>{brand.logoText}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {payment.provider.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatCurrency(payment.amount_kobo)} · {payment.account_number}
        </Text>
      </View>
      <View style={styles.repeatBadge}>
        <RotateCcw size={12} color={TEAL_ACCENT} strokeWidth={2.4} />
      </View>
      <Text style={styles.date}>{dateLabel}</Text>
    </Pressable>
  );
}

type Props = {
  limit?: number;
  title?: string;
};

export const PayAgainSection = memo(function PayAgainSection({
  limit = 8,
  title = 'Pay again',
}: Props) {
  const { openPayment } = usePaymentModal();
  const recentQuery = useRecentUtilityPayments({ limit });
  const payments = recentQuery.data ?? [];

  const handleRepeat = useCallback(
    (payment: RecentUtilityPayment) => {
      openPayment({
        provider: payment.provider,
        accountNumber: payment.account_number,
        amountKobo: payment.amount_kobo,
      });
    },
    [openPayment],
  );

  if (payments.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel>{title}</EsoPaySectionLabel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {payments.map((payment) => (
          <PayAgainChip key={payment.id} payment={payment} onRepeat={handleRepeat} />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: ESO_PAY_TEXT_PRIMARY,
  },
  scroll: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  chip: {
    width: 168,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: ESO_PAY_SURFACE,
    padding: spacing.md,
    gap: spacing.sm,
  },
  chipPressed: {
    opacity: 0.88,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  copy: {
    gap: 2,
    minHeight: 36,
  },
  name: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  repeatBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 160, 23, 0.12)',
  },
  date: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: ESO_PAY_TEXT_SECONDARY,
    letterSpacing: 0.3,
  },
});
