import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedMetric } from '@/components/perceived/AnimatedMetric';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { FleetSummary } from '@/types/fleet';

export type FleetHeaderLiveMetrics = {
  totalLoadKw: number;
  animated: boolean;
};

type Props = {
  summary: FleetSummary;
  liveCount: number;
  streamingLive?: boolean;
  liveMetrics?: FleetHeaderLiveMetrics;
};

function formatLoad(loadKw: number) {
  if (loadKw >= 1000) return `${(loadKw / 1000).toFixed(1)} MW`;
  return `${Math.round(loadKw)} kW`;
}

export const FleetCommandHeader = memo(function FleetCommandHeader({
  summary,
  liveCount,
  streamingLive = false,
  liveMetrics,
}: Props) {
  const reducedMotion = useReducedMotion();
  const displayLoadKw = liveMetrics?.totalLoadKw ?? summary.totalLoadKw;
  const loadLabel = formatLoad(displayLoadKw);
  const showLivePill = streamingLive && liveCount > 0;
  const showAnimatedLoad = liveMetrics?.animated && displayLoadKw > 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Fleet</Text>
          <Text style={styles.subtitle}>
            {summary.siteCount} sites · {liveCount} live ·{' '}
            {showAnimatedLoad ? (
              <AnimatedMetric value={displayLoadKw} format={formatLoad} durationMs={1800} />
            ) : (
              loadLabel
            )}
          </Text>
        </View>
        {showLivePill ? (
          <View style={styles.livePill}>
            <FleetStatusPulse status="live" size="sm" reducedMotion={reducedMotion} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.stalePill}>
            <Text style={styles.staleText}>{liveCount > 0 ? 'STALE' : 'OFFLINE'}</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.title,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    minHeight: 36,
  },
  liveText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: '#FFFFFF',
    letterSpacing: 1.4,
  },
  stalePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    minHeight: 36,
    justifyContent: 'center',
  },
  staleText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
});
