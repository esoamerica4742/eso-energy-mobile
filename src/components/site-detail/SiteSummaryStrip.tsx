import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { AnimatedMetric } from '@/components/perceived/AnimatedMetric';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { EnodeSiteSummary } from '@/services/enode.types';

type Props = {
  summary: EnodeSiteSummary | null | undefined;
  streamingLive?: boolean;
};

function formatSolarKw(v: number) {
  return `${Math.round(v)} kW`;
}

function formatLoadKw(v: number) {
  return `${Math.round(v)} kW`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function AnimatedMetricCell({
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
      <AnimatedMetric value={value} format={format} durationMs={1800} style={styles.valueAnimated} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export const SiteSummaryStrip = memo(function SiteSummaryStrip({
  summary,
  streamingLive = false,
}: Props) {
  if (!summary) return null;

  const solarKw = Number(summary.total_solar_kw ?? 0);
  const loadKw = Number(summary.total_load_kw ?? 0);
  const showAnimated = streamingLive && (solarKw > 0 || loadKw > 0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>SITE SUMMARY</Text>
      <CardShell glowColor="gold" borderVariant="gold">
        <View style={styles.row}>
          <Metric
            label="Devices"
            value={`${summary.online_count ?? 0}/${summary.device_count ?? 0}`}
          />
          <View style={styles.divider} />
          {showAnimated ? (
            <AnimatedMetricCell label="Solar" value={solarKw} format={formatSolarKw} />
          ) : (
            <Metric label="Solar" value={formatSolarKw(solarKw)} />
          )}
          <View style={styles.divider} />
          {showAnimated ? (
            <AnimatedMetricCell label="Load" value={loadKw} format={formatLoadKw} />
          ) : (
            <Metric label="Load" value={formatLoadKw(loadKw)} />
          )}
        </View>
      </CardShell>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  section: {
    fontFamily: fonts.semibold,
    fontSize: FontSize.label,
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  valueAnimated: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  label: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
