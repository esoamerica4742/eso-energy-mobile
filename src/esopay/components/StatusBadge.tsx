import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Lock,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import type { BillStatus } from '@/esopay/api/types';
import { billStatusLabel } from '@/esopay/utils/billUi';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';

type Props = {
  status: BillStatus;
};

type BadgeTheme = {
  bg: string;
  border: string;
  text: string;
  icon: LucideIcon;
};

function themeForStatus(status: BillStatus): BadgeTheme {
  switch (status) {
    case 'paid':
      return {
        bg: `${T.color.platinum.paid}18`,
        border: `${T.color.platinum.paid}44`,
        text: T.color.platinum.paid,
        icon: CheckCircle2,
      };
    case 'overdue':
      return {
        bg: `${T.color.red.alert}18`,
        border: `${T.color.red.alert}44`,
        text: T.color.red.alert,
        icon: AlertCircle,
      };
    case 'payment_initiated':
      return {
        bg: `${T.color.amber.partial}18`,
        border: `${T.color.amber.partial}44`,
        text: T.color.amber.partial,
        icon: Loader2,
      };
    case 'offset_calculated':
      return {
        bg: `${T.color.emerald.live}14`,
        border: `${T.color.emerald.live}33`,
        text: T.color.emerald.live,
        icon: Zap,
      };
    case 'void':
      return {
        bg: `${T.color.text.disabled}22`,
        border: T.color.border.subtle,
        text: T.color.text.disabled,
        icon: Lock,
      };
    case 'pending':
    default:
      return {
        bg: `${T.color.gold.primary}14`,
        border: `${T.color.border.active}`,
        text: T.color.gold.shimmer,
        icon: Clock3,
      };
  }
}

export const StatusBadge = memo(function StatusBadge({ status }: Props) {
  const theme = themeForStatus(status);
  const Icon = theme.icon;

  return (
    <View style={[styles.pill, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <Icon size={12} color={theme.text} strokeWidth={2.2} />
      <Text style={[styles.label, { color: theme.text }]}>{billStatusLabel(status)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.xs,
    paddingHorizontal: T.spacing.sm,
    paddingVertical: T.spacing.xs,
    borderRadius: T.radius.full,
    borderWidth: 1,
  },
  label: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.label.size,
    lineHeight: T.type.label.lineHeight,
    letterSpacing: T.type.label.letterSpacing,
    textTransform: 'uppercase',
  },
});
