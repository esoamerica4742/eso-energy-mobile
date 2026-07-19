import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/esopay/components/Skeleton';
import {
  BILL_PAY_GRID_COLS,
  BILL_PAY_GRID_H_PAD,
  BILL_PAY_GRID_ITEM_MARGIN,
  HOME_BILL_CATEGORY_CARD_HEIGHT,
} from '@/esopay/components/bills/billPayCardTheme';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { HOME_CARD_BORDER } from '@/esopay/theme/brandColors';
import { spacing } from '@/esopay/theme/spacing';

const PLACEHOLDER_CARDS = 4;

function SkeletonBillCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={32} width={32} borderRadius={16} />
      <Skeleton height={14} width="78%" borderRadius={6} style={{ marginTop: 12 }} />
      <Skeleton height={11} width="52%" borderRadius={6} style={{ marginTop: 8 }} />
    </View>
  );
}

type Props = {
  showSectionLabels?: boolean;
};

export const BillsHubSkeleton = memo(function BillsHubSkeleton({
  showSectionLabels = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel style={styles.titleMuted}>Services</EsoPaySectionLabel>
      {showSectionLabels ? (
        <Skeleton height={10} width={72} borderRadius={4} style={styles.groupLabel} />
      ) : null}
      <View style={styles.grid}>
        {Array.from({ length: PLACEHOLDER_CARDS }, (_, i) => (
          <View key={i} style={styles.gridItem}>
            <SkeletonBillCard />
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingHorizontal: BILL_PAY_GRID_H_PAD,
  },
  titleMuted: {
    opacity: 0.5,
  },
  groupLabel: {
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -BILL_PAY_GRID_ITEM_MARGIN,
  },
  gridItem: {
    width: `${100 / BILL_PAY_GRID_COLS}%`,
    padding: BILL_PAY_GRID_ITEM_MARGIN,
  },
  card: {
    minHeight: HOME_BILL_CATEGORY_CARD_HEIGHT,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
