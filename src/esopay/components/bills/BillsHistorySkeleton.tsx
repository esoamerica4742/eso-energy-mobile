import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/esopay/components/Skeleton';
import { luxury } from '@/esopay/theme/luxury';

const ROWS = 4;

function SkeletonHistoryRow() {
  return (
    <View style={styles.row}>
      <Skeleton height={32} width={32} borderRadius={8} />
      <View style={styles.middle}>
        <Skeleton height={14} width="70%" borderRadius={6} />
        <Skeleton height={11} width="45%" borderRadius={6} style={{ marginTop: 6 }} />
        <Skeleton height={10} width="38%" borderRadius={6} style={{ marginTop: 6 }} />
      </View>
      <View style={styles.right}>
        <Skeleton height={14} width={56} borderRadius={6} />
        <Skeleton height={18} width={52} borderRadius={999} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export const BillsHistorySkeleton = memo(function BillsHistorySkeleton() {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: ROWS }, (_, i) => (
        <View key={i}>
          <SkeletonHistoryRow />
          {i < ROWS - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  right: {
    alignItems: 'flex-end',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(212, 160, 23, 0.18)',
    marginLeft: 44,
  },
});
