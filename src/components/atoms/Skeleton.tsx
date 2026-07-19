import { useEffect } from 'react';
import { View, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { CARD_WIDTH } from '@/components/cards/KpiCard';
import { SkeletonShimmerProvider, useSkeletonShimmer } from '@/components/atoms/SkeletonShimmerProvider';
import { colors, radius, spacing } from '@/theme/tokens';

type BlockProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Local Reanimated shimmer — Moti loops crash on Reanimated 4 worklets. */
function LocalShimmer() {
  const translateX = useSharedValue(-140);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(260, { duration: 1050, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(translateX);
  }, [translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: 0.45,
  }));

  return <Animated.View style={[styles.shimmer, shimmerStyle]} />;
}

function SkeletonBlockShared({
  width = '100%',
  height = 14,
  borderRadius = radius.badge,
  style,
}: BlockProps) {
  const sharedShift = useSkeletonShimmer();
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (sharedShift?.value ?? -1) * 400 - 200 }],
    opacity: sharedShift ? 0.55 : 0,
  }));

  return (
    <View style={[{ width, height, borderRadius, backgroundColor: colors.bgElevated, overflow: 'hidden' }, style]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
}

export function SkeletonBlock(props: BlockProps) {
  const sharedShift = useSkeletonShimmer();
  if (sharedShift) return <SkeletonBlockShared {...props} />;

  return (
    <View
      style={[
        { width: props.width ?? '100%', height: props.height ?? 14, borderRadius: props.borderRadius ?? radius.badge, backgroundColor: colors.bgElevated, overflow: 'hidden' },
        props.style,
      ]}
    >
      <LocalShimmer />
    </View>
  );
}

export function SkeletonRow({ height = 58 }: { height?: number }) {
  return (
    <SkeletonBlock
      height={height}
      borderRadius={radius.card}
      style={styles.rowMargin}
    />
  );
}

export function SkeletonCard() {
  return <SkeletonRow height={120} />;
}

export function SkeletonSectionLabel() {
  return (
    <View style={styles.sectionLabel}>
      <SkeletonBlock width={72} height={10} borderRadius={4} />
      <SkeletonBlock width={48} height={10} borderRadius={4} />
    </View>
  );
}

export function SkeletonKpiRow({ count = 4 }: { count?: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.kpiScroll}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.kpiCard}>
          <SkeletonBlock width={80} height={10} borderRadius={4} />
          <SkeletonBlock width={100} height={28} borderRadius={6} style={{ marginTop: spacing.sm }} />
          <SkeletonBlock width={56} height={10} borderRadius={4} style={{ marginTop: spacing.sm }} />
        </View>
      ))}
    </ScrollView>
  );
}

export function SkeletonPowerNetwork() {
  return (
    <View style={styles.powerCard}>
      <View style={styles.powerHeader}>
        <SkeletonBlock width={100} height={10} borderRadius={4} />
        <SkeletonBlock width={140} height={18} borderRadius={6} style={{ marginTop: 6 }} />
      </View>
      <View style={styles.powerRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.powerCell}>
            <SkeletonBlock width={56} height={8} borderRadius={4} />
            <SkeletonBlock width={72} height={20} borderRadius={6} style={{ marginTop: 8 }} />
            <SkeletonBlock width={88} height={8} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonEnodeDeviceCard() {
  return (
    <View style={styles.enodeCard}>
      <View style={styles.enodeHeader}>
        <SkeletonBlock width={40} height={40} borderRadius={radius.button} />
        <View style={styles.enodeTitleCol}>
          <SkeletonBlock width="70%" height={14} borderRadius={4} />
          <SkeletonBlock width="50%" height={10} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBlock width={64} height={22} borderRadius={radius.button} />
      </View>
      <View style={styles.enodeStats}>
        <SkeletonBlock width={72} height={36} borderRadius={6} />
        <SkeletonBlock width={72} height={36} borderRadius={6} />
      </View>
    </View>
  );
}

export function SkeletonChart({ height = 160 }: { height?: number }) {
  const bars = [0.4, 0.65, 0.5, 0.8, 0.55, 0.7, 0.45, 0.6, 0.75, 0.5];
  return (
    <View style={[styles.chartWrap, { minHeight: height }]}>
      <SkeletonBlock width={120} height={10} borderRadius={4} />
      <View style={styles.chartBars}>
        {bars.map((h, i) => (
          <SkeletonBlock
            key={i}
            width={8}
            height={Math.round(80 * h)}
            borderRadius={3}
            style={styles.chartBar}
          />
        ))}
      </View>
      <View style={styles.chartLegend}>
        <SkeletonBlock width={100} height={8} borderRadius={4} />
        <SkeletonBlock width={88} height={8} borderRadius={4} />
      </View>
    </View>
  );
}

export function SkeletonBranchList({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.branchWrap}>
      <View style={styles.branchHeader}>
        {[1.4, 2, 1, 1.5, 1].map((f, i) => (
          <SkeletonBlock key={i} width={`${f * 12}%`} height={8} borderRadius={4} style={{ flex: f }} />
        ))}
      </View>
      <View style={styles.branchBox}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.branchRow}>
            <SkeletonBlock width={8} height={8} borderRadius={4} style={{ flex: 1.4 }} />
            <SkeletonBlock width="60%" height={12} borderRadius={4} style={{ flex: 2, marginHorizontal: spacing.sm }} />
            <SkeletonBlock width={40} height={12} borderRadius={4} style={{ flex: 1 }} />
            <SkeletonBlock width={48} height={12} borderRadius={4} style={{ flex: 1.5, marginLeft: spacing.sm }} />
            <SkeletonBlock width={36} height={12} borderRadius={4} style={{ flex: 1 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonMap() {
  return (
    <View style={styles.mapWrap}>
      <SkeletonBlock width="100%" height={220} borderRadius={radius.card} />
    </View>
  );
}

export function SkeletonAlertList({ rows = 3 }: { rows?: number }) {
  return (
    <SkeletonShimmerProvider>
      <View style={styles.alertsPad}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.alertRow}>
            <SkeletonBlock width={36} height={36} borderRadius={radius.button} />
            <View style={styles.alertText}>
              <SkeletonBlock width="90%" height={14} borderRadius={4} />
              <SkeletonBlock width="70%" height={10} borderRadius={4} style={{ marginTop: 8 }} />
            </View>
          </View>
        ))}
      </View>
    </SkeletonShimmerProvider>
  );
}

export function SkeletonListRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.listRow}>
          <SkeletonBlock width="75%" height={14} borderRadius={4} />
        </View>
      ))}
    </>
  );
}

export function SkeletonCreditBalance() {
  return (
    <View style={styles.creditCard}>
      <SkeletonBlock width={120} height={10} borderRadius={4} />
      <SkeletonBlock width={160} height={32} borderRadius={6} style={{ marginTop: spacing.md }} />
      <SkeletonBlock width={100} height={12} borderRadius={4} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

export function SkeletonAuthSplash() {
  return (
    <SkeletonShimmerProvider>
      <View style={styles.splash}>
        <View style={styles.splashHeader}>
          <SkeletonBlock width={120} height={22} borderRadius={6} />
          <SkeletonBlock width={180} height={12} borderRadius={4} style={{ marginTop: spacing.sm }} />
          <SkeletonBlock width={80} height={10} borderRadius={4} style={{ marginTop: spacing.md }} />
        </View>
        <SkeletonKpiRow count={2} />
        <SkeletonPowerNetwork />
        <SkeletonSectionLabel />
        <SkeletonEnodeDeviceCard />
      </View>
    </SkeletonShimmerProvider>
  );
}

export function SkeletonCommandCard({ height = 168 }: { height?: number }) {
  return (
    <View style={styles.commandCard}>
      <SkeletonBlock width={120} height={10} borderRadius={4} />
      <SkeletonBlock width="55%" height={18} borderRadius={6} style={{ marginTop: spacing.sm }} />
      <SkeletonBlock width="100%" height={height} borderRadius={radius.card} style={{ marginTop: spacing.md }} />
    </View>
  );
}

export function SkeletonCommandHeader() {
  return (
    <View style={styles.commandHeader}>
      <View style={styles.commandHeaderTop}>
        <SkeletonBlock width={44} height={44} borderRadius={8} />
        <View style={styles.commandHeaderCopy}>
          <SkeletonBlock width={140} height={22} borderRadius={6} />
          <SkeletonBlock width={96} height={10} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBlock width={56} height={28} borderRadius={radius.pill} />
      </View>
      <SkeletonBlock width={88} height={24} borderRadius={radius.pill} style={{ marginTop: spacing.md }} />
    </View>
  );
}

export function DashboardLoadingContent() {
  return (
    <SkeletonShimmerProvider>
      <SkeletonCommandHeader />
      <View style={styles.commandPad}>
        <SkeletonCommandCard height={72} />
      </View>
      <SkeletonSectionLabel />
      <View style={styles.commandPad}>
        <SkeletonCommandCard />
        <SkeletonCommandCard />
      </View>
      <SkeletonSectionLabel />
      <View style={styles.commandPad}>
        <SkeletonPowerNetwork />
        <SkeletonCommandCard height={220} />
      </View>
    </SkeletonShimmerProvider>
  );
}

export function SitesLoadingContent() {
  return (
    <SkeletonShimmerProvider>
      <SkeletonMap />
      <SkeletonSectionLabel />
      <SkeletonBranchList rows={6} />
    </SkeletonShimmerProvider>
  );
}

export function SiteDetailLoadingContent() {
  return (
    <>
      <View style={styles.siteHero}>
        <SkeletonBlock width={72} height={22} borderRadius={radius.button} />
        <SkeletonBlock width={180} height={48} borderRadius={8} style={{ marginTop: spacing.md }} />
        <SkeletonBlock width="85%" height={12} borderRadius={4} style={{ marginTop: spacing.sm }} />
      </View>
      <SkeletonChart height={200} />
      <View style={styles.siteSheet}>
        <SkeletonBlock width={120} height={16} borderRadius={4} />
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.siteMetric}>
            <SkeletonBlock width={80} height={12} borderRadius={4} />
            <SkeletonBlock width={64} height={12} borderRadius={4} />
          </View>
        ))}
      </View>
    </>
  );
}

export function EnodeLoadingContent() {
  return (
    <View style={styles.enodeSection}>
      <SkeletonSectionLabel />
      <View style={styles.enodePad}>
        <SkeletonEnodeDeviceCard />
      </View>
      <SkeletonChart />
    </View>
  );
}

export function LinkDeviceLoadingContent() {
  return (
    <View style={styles.linkPad}>
      <SkeletonBlock width={64} height={12} borderRadius={4} />
      <SkeletonBlock width="90%" height={28} borderRadius={6} style={{ marginTop: spacing.lg }} />
      <SkeletonBlock width="100%" height={48} borderRadius={radius.card} style={{ marginTop: spacing.xl }} />
      <SkeletonBlock width="100%" height={48} borderRadius={radius.card} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 110,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  rowMargin: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  kpiScroll: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  kpiCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  powerCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  powerHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  powerRow: { flexDirection: 'row' },
  powerCell: { flex: 1, padding: spacing.lg },
  enodeCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  enodeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  enodeTitleCol: { flex: 1 },
  enodeStats: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg },
  enodePad: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  enodeSection: { marginBottom: spacing.lg },
  chartWrap: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  chartBar: { alignSelf: 'flex-end' },
  chartLegend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  branchWrap: { marginHorizontal: spacing.xl },
  branchHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgBase,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  branchBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.borderSubtle,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
    overflow: 'hidden',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  mapWrap: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  alertsPad: { padding: spacing.xl, gap: spacing.sm },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
    minHeight: 72,
  },
  alertText: { flex: 1 },
  listRow: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
  creditCard: {
    marginTop: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    padding: spacing.lg,
  },
  splash: {
    flex: 1,
    backgroundColor: colors.bgBase,
    paddingTop: spacing.xxxl,
  },
  splashHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  siteHero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  siteSheet: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  siteMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  linkPad: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  commandPad: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  commandCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  commandHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  commandHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commandHeaderCopy: {
    flex: 1,
  },
});
