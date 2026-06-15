import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/esopay/components/Skeleton';
import {
  BILL_PAY_GRID_COLS,
  BILL_PAY_GRID_H_PAD,
  BILL_PAY_GRID_ITEM_MARGIN,
  BILL_PAY_GRID_MIN_HEIGHT,
} from '@/esopay/components/bills/billPayCardTheme';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
const PLACEHOLDER_CARDS = 4;

function SkeletonBillCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Skeleton height={32} width={32} borderRadius={8} />
        <Skeleton height={26} width={44} borderRadius={8} />
      </View>
      <Skeleton height={14} width="85%" borderRadius={6} />
      <Skeleton height={11} width="60%" borderRadius={6} style={{ marginTop: 6 }} />
      <Skeleton height={36} width="100%" borderRadius={999} style={{ marginTop: 10 }} />
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
      {showSectionLabels ? <Skeleton height={10} width={72} borderRadius={4} style={styles.groupLabel} /> : null}
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
  title: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: luxury.warmWhite,
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
    minHeight: BILL_PAY_GRID_MIN_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.12)',
    backgroundColor: luxury.surface,
    padding: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
