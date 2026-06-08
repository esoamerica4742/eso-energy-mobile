import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { AnimatedMetric } from '@/components/perceived/AnimatedMetric';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { FleetSummary } from '@/types/fleet';

export type FleetLiveKpiMetrics = {
  totalLoadKw: number;
  avgBatteryPct: number;
  animated: boolean;
};

type Props = {
  summary: FleetSummary;
  liveMetrics?: FleetLiveKpiMetrics;
};

function formatLoad(loadKw: number) {
  if (loadKw >= 1000) return `${(loadKw / 1000).toFixed(1)} MW`;
  return `${Math.round(loadKw)} kW`;
}

function formatBatteryPct(v: number) {
  return `${Math.round(v)}%`;
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell} accessibilityRole="text" accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function AnimatedCell({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
}) {
  return (
    <View style={styles.cell}>
      <AnimatedMetric value={value} format={format} durationMs={1800} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export const FleetKpiRibbon = memo(function FleetKpiRibbon({ summary, liveMetrics }: Props) {
  const displayLoadKw = liveMetrics?.totalLoadKw ?? summary.totalLoadKw;
  const loadLabel = formatLoad(displayLoadKw);
  const showAnimated = liveMetrics?.animated && displayLoadKw > 0;

  return (
    <CardShell glowColor="gold" borderVariant="gold" style={styles.shell}>
      <View style={styles.row}>
        {showAnimated ? (
          <AnimatedCell label="Total load" value={displayLoadKw} format={formatLoad} />
        ) : (
          <MetricCell label="Total load" value={loadLabel} />
        )}
        <View style={styles.divider} />
        {showAnimated ? (
          <AnimatedCell label="Avg SOC" value={liveMetrics.avgBatteryPct} format={formatBatteryPct} />
        ) : (
          <MetricCell label="Avg SOC" value={`${summary.avgBatteryPct}%`} />
        )}
        <View style={styles.divider} />
        <MetricCell label="Healthy" value={`${summary.healthySites}/${summary.siteCount}`} />
        <View style={styles.divider} />
        <MetricCell label="Alerts" value={`${summary.activeAlerts}`} />
      </View>
    </CardShell>
  );
});

const styles = StyleSheet.create({
  shell: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
