import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { BillHistoryRowModel } from '@/esopay/lib/billHistoryDisplay';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  item: BillHistoryRowModel;
  showDivider?: boolean;
  onPress?: (item: BillHistoryRowModel) => void;
};

export const BillHistoryRow = memo(function BillHistoryRow({
  item,
  showDivider = false,
  onPress,
}: Props) {
  const statusNote =
    item.status === 'failed' ? 'Failed' : item.status === 'pending' ? 'Pending' : null;

  const content = (
    <View style={[styles.row, showDivider && styles.rowDivider]}>
      <View style={[styles.icon, { backgroundColor: item.brand.logoBg }]}>
        <Text style={[styles.iconText, { color: item.brand.logoFg }]}>{item.brand.logoText}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.service} numberOfLines={1}>
          {item.serviceName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {statusNote ? `${statusNote} · ${item.dateTime}` : item.dateTime}
        </Text>
      </View>
      <Text style={[styles.amount, item.status === 'failed' && styles.amountFailed]}>
        {formatCurrency(item.amountKobo)}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(item);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Pay again ${item.distributor}`}
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
  },
  middle: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  service: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  amount: {
    fontFamily: ds.font.amount,
    fontSize: 15,
    letterSpacing: -0.2,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  amountFailed: {
    color: ds.color.error,
  },
});
