import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar, ChevronRight } from 'lucide-react-native';
import type { EsoPayBill } from '@/esopay/api/types';
import { LiveStatusDot } from '@/esopay/components/LiveStatusDot';
import { StatusBadge } from '@/esopay/components/StatusBadge';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';
import {
  billOffsetPercent,
  billOffsetStatusKey,
  formatBillPeriod,
  formatDueDate,
} from '@/esopay/utils/billUi';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  bill: EsoPayBill;
  onPress: () => void;
  animationIndex?: number;
};

export const BillCard = memo(function BillCard({
  bill,
  onPress,
  animationIndex = 0,
}: Props) {
  const offsetStatus = billOffsetStatusKey(bill);
  const offsetPct = billOffsetPercent(bill);
  const enteringDelay = animationIndex * T.animation.staggerStepMs;

  return (
    <Animated.View
      entering={FadeInDown.delay(enteringDelay)
        .springify()
        .damping(T.animation.cardEntrance.spring.damping)
        .stiffness(T.animation.cardEntrance.spring.stiffness)}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Bill ${bill.utility_provider}, ${formatCurrency(bill.net_amount_kobo, bill.currency)}`}
      >
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.utility} numberOfLines={1}>
              {bill.utility_provider}
            </Text>
            <Text style={styles.period} numberOfLines={1}>
              {formatBillPeriod(bill.billing_period_start, bill.billing_period_end)}
            </Text>
          </View>
          <ChevronRight size={T.icon.inline} color={T.color.text.secondary} strokeWidth={2} />
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amount}>{formatCurrency(bill.net_amount_kobo, bill.currency)}</Text>
          <StatusBadge status={bill.status} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.dueRow}>
            <Calendar size={14} color={T.color.text.secondary} strokeWidth={2} />
            <Text style={styles.dueText}>Due {formatDueDate(bill.due_date)}</Text>
          </View>

          <View style={styles.offsetRow}>
            <LiveStatusDot status={offsetStatus} size={7} />
            <Text style={styles.offsetText}>
              {bill.status === 'paid'
                ? 'Settled'
                : `${offsetPct.toFixed(0)}% inverter offset`}
            </Text>
          </View>
        </View>

        <View style={styles.goldLine} />
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.color.bg.surface,
    borderRadius: T.radius.sm,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    paddingHorizontal: T.layout.cardPaddingHorizontal,
    paddingVertical: T.layout.cardPaddingVertical,
    marginBottom: T.spacing.md,
    ...T.shadow.card,
  },
  cardPressed: {
    backgroundColor: T.color.bg.elevated,
    borderColor: T.color.border.active,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: T.spacing.md,
  },
  titleBlock: {
    flex: 1,
    paddingRight: T.spacing.sm,
  },
  utility: {
    fontFamily: esopayFonts.heading,
    fontSize: T.type.h2.size,
    lineHeight: T.type.h2.lineHeight,
    letterSpacing: T.type.h2.letterSpacing,
    color: T.color.text.primary,
  },
  period: {
    marginTop: T.spacing.xs,
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    lineHeight: T.type.caption.lineHeight,
    color: T.color.text.secondary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: T.spacing.md,
  },
  amount: {
    fontFamily: esopayFonts.display,
    fontSize: T.type.h1.size,
    lineHeight: T.type.h1.lineHeight,
    letterSpacing: T.type.h1.letterSpacing,
    color: T.color.gold.shimmer,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: T.spacing.sm,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.xs,
    flex: 1,
  },
  dueText: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
  },
  offsetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.xs,
  },
  offsetText: {
    fontFamily: esopayFonts.mono,
    fontSize: T.type.mono.size,
    lineHeight: T.type.mono.lineHeight,
    color: T.color.text.secondary,
  },
  goldLine: {
    position: 'absolute',
    left: T.layout.cardPaddingHorizontal,
    right: T.layout.cardPaddingHorizontal,
    bottom: 0,
    height: 1,
    backgroundColor: `${T.color.gold.primary}22`,
  },
});
