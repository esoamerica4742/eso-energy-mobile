import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { BillHistoryRowModel } from '@/esopay/lib/billHistoryDisplay';
import { luxury } from '@/esopay/theme/luxury';
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
  const statusStyle =
    item.status === 'success'
      ? styles.successBadge
      : item.status === 'failed'
        ? styles.failedBadge
        : styles.pendingBadge;
  const statusTextStyle =
    item.status === 'success'
      ? styles.successText
      : item.status === 'failed'
        ? styles.failedText
        : styles.pendingText;
  const statusLabel =
    item.status === 'success' ? 'Success' : item.status === 'failed' ? 'Failed' : 'Pending';

  const content = (
    <>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: item.brand.logoBg }]}>
          <Text style={[styles.iconText, { color: item.brand.logoFg }]}>{item.brand.logoText}</Text>
        </View>
        <View style={styles.middle}>
          <Text style={styles.service} numberOfLines={1}>
            {item.serviceName}
          </Text>
          <Text style={styles.distributor} numberOfLines={1}>
            {item.distributor}
          </Text>
          <Text style={styles.dateTime}>{item.dateTime}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>{formatCurrency(item.amountKobo)}</Text>
          <View style={statusStyle}>
            <Text style={statusTextStyle}>{statusLabel}</Text>
          </View>
        </View>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
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
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  icon: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginTop: 2,
  },
  iconText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  middle: { flex: 1, gap: 2, minWidth: 0 },
  service: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: luxury.textPrimary,
  },
  distributor: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: luxury.textMuted,
  },
  dateTime: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: luxury.textDim,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: luxury.textPrimary,
  },
  successBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  successText: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    color: luxury.green,
  },
  pendingBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  pendingText: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    color: '#F59E0B',
  },
  failedBadge: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  failedText: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    color: '#EF4444',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: luxury.goldBorder,
    marginLeft: 44,
  },
});
