import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { AnimatedMetric } from '@/components/perceived/AnimatedMetric';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { Colors, FontSize, MonitoringLayout, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { DashboardCommandSnapshot } from '@/lib/dashboardCommandData';

export type DashboardLiveKpiMetrics = {
  batteryPct: number;
  loadKw: number;
  solarKw: number;
  animated: boolean;
};

type Props = {
  snapshot: DashboardCommandSnapshot;
  liveMetrics?: DashboardLiveKpiMetrics;
};

function formatLoad(loadKw: number) {
  if (loadKw >= 1000) return `${(loadKw / 1000).toFixed(1)} MW`;
  return `${Math.round(loadKw)} kW`;
}

function formatSolarMetric(v: number) {
  return v > 0 ? formatLoad(v) : '—';
}

function formatBatteryPct(v: number) {
  return v > 0 ? `${Math.round(v)}%` : '—';
}

function formatLoadMetric(v: number) {
  return v > 0 ? formatLoad(v) : '—';
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const color = pendingMetricColor(value, accent ?? Colors.textPrimary);
  return (
    <View style={styles.cell}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function AnimatedCell({
  label,
  value,
  format,
  accent,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  accent?: string;
}) {
  return (
    <View style={styles.cell}>
      <AnimatedMetric value={value} format={format} accent={accent} durationMs={1800} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function borderVariant(tone: DashboardCommandSnapshot['statusTone']) {
  if (tone === 'live') return 'gold' as const;
  if (tone === 'fault') return 'muted' as const;
  if (tone === 'warning' || tone === 'degraded') return 'amber' as const;
  return 'muted' as const;
}

export const DashboardKpiStrip = memo(function DashboardKpiStrip({ snapshot, liveMetrics }: Props) {
  const batteryAccent =
    snapshot.batteryPct <= 10
      ? Colors.alert
      : snapshot.batteryPct >= 20
        ? Colors.battery
        : Colors.warning;

  const showAnimated =
    liveMetrics?.animated &&
    snapshot.statusTone === 'live' &&
    liveMetrics.batteryPct > 0;

  return (
    <CardShell glowColor="none" borderVariant={borderVariant(snapshot.statusTone)} style={styles.shell}>
      <Text style={styles.eyebrow}>SITE SNAPSHOT</Text>
      <View style={styles.row}>
        {showAnimated ? (
          <AnimatedCell
            label="Battery"
            value={liveMetrics.batteryPct}
            format={formatBatteryPct}
            accent={batteryAccent}
          />
        ) : (
          <Cell
            label="Battery"
            value={snapshot.batteryPct > 0 ? `${snapshot.batteryPct}%` : '—'}
            accent={snapshot.batteryPct > 0 ? batteryAccent : undefined}
          />
        )}
        <View style={styles.divider} />
        {showAnimated ? (
          <AnimatedCell
            label="Load"
            value={liveMetrics.loadKw}
            format={formatLoadMetric}
            accent={Colors.grid}
          />
        ) : (
          <Cell label="Load" value={snapshot.loadLabel} accent={Colors.grid} />
        )}
        <View style={styles.divider} />
        {showAnimated ? (
          <AnimatedCell
            label="Solar output"
            value={liveMetrics.solarKw}
            format={formatSolarMetric}
            accent={Colors.gold}
          />
        ) : (
          <Cell label="Solar output" value={snapshot.solarOutputLabel} accent={Colors.gold} />
        )}
      </View>
    </CardShell>
  );
});

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: MonitoringLayout.cardMarginH,
    marginBottom: 0,
  },
  eyebrow: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  label: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.micro,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
