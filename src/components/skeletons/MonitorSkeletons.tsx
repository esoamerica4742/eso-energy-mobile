import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '@/components/atoms/Skeleton';
import { Radius, Spacing } from '@/tokens/design';
import { radius } from '@/theme/tokens';
import { spacing } from '@/theme/tokens';

const SKELETON_BASE = '#1A2035';

export function TelemetryChartSkeleton() {
  return (
    <View style={styles.chartShell}>
      <View style={styles.chartHeader}>
        <SkeletonBlock width={120} height={12} style={styles.block} />
        <SkeletonBlock width={64} height={12} style={styles.block} />
      </View>
      <SkeletonBlock width="100%" height={180} borderRadius={Radius.md} style={styles.block} />
      <View style={styles.legendRow}>
        <SkeletonBlock width={72} height={10} style={styles.block} />
        <SkeletonBlock width={72} height={10} style={styles.block} />
        <SkeletonBlock width={72} height={10} style={styles.block} />
      </View>
    </View>
  );
}

export function InverterCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBlock width={140} height={14} style={styles.block} />
      <SkeletonBlock width="55%" height={36} borderRadius={8} style={[styles.block, { marginTop: spacing.lg }]} />
      <View style={styles.metricRow}>
        <SkeletonBlock width="30%" height={48} borderRadius={Radius.sm} style={styles.block} />
        <SkeletonBlock width="30%" height={48} borderRadius={Radius.sm} style={styles.block} />
        <SkeletonBlock width="30%" height={48} borderRadius={Radius.sm} style={styles.block} />
      </View>
    </View>
  );
}

export function OperationsGuardSkeleton() {
  return (
    <View style={styles.guardStack}>
      <SkeletonBlock width="100%" height={120} borderRadius={radius.card} style={styles.block} />
      <SkeletonBlock width="100%" height={120} borderRadius={radius.card} style={styles.block} />
      <SkeletonBlock width="100%" height={120} borderRadius={radius.card} style={styles.block} />
    </View>
  );
}

export function SiteCardSkeleton() {
  return <SkeletonBlock width="100%" height={96} borderRadius={radius.card} style={styles.block} />;
}

export function ReportsSkeleton() {
  return (
    <View style={styles.guardStack}>
      <SkeletonBlock width="100%" height={140} borderRadius={radius.card} style={styles.block} />
      <SkeletonBlock width="100%" height={88} borderRadius={radius.card} style={styles.block} />
      <SkeletonBlock width="100%" height={88} borderRadius={radius.card} style={styles.block} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: SKELETON_BASE,
  },
  chartShell: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: SKELETON_BASE,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  guardStack: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
