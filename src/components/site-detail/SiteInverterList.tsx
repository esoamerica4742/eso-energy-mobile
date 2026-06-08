import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedMetric } from '@/components/perceived/AnimatedMetric';
import { usePerceivedScalar } from '@/hooks/usePerceivedScalar';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { CardShell } from '@/components/cards/CardShell';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { SiteInverterRow } from '@/lib/siteDetailData';

type Props = {
  inverters: SiteInverterRow[];
  streamingLive?: boolean;
  smooth?: boolean;
};

function formatSolarKw(v: number) {
  return `${Math.round(v)} kW`;
}

function formatLoadKw(v: number) {
  return `${Math.round(v)} kW`;
}

function formatBatteryPct(v: number) {
  return `${Math.round(v)}%`;
}

const InverterCard = memo(function InverterCard({
  inverter,
  streamingLive = false,
  smooth = true,
}: {
  inverter: SiteInverterRow;
  streamingLive?: boolean;
  smooth?: boolean;
}) {
  const live = streamingLive && inverter.status === 'live';
  const solarKw = usePerceivedScalar(inverter.solarKw, live, smooth);
  const loadKw = usePerceivedScalar(inverter.loadKw, live, smooth);
  const batteryPct = usePerceivedScalar(inverter.batteryPct ?? 0, live && inverter.batteryPct != null, smooth);
  return (
    <CardShell
      glowColor={inverter.status === 'live' ? 'mint' : 'none'}
      borderVariant={inverter.status === 'degraded' ? 'amber' : 'gold'}
      style={styles.cardSpacing}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <FleetStatusPulse status={inverter.status} size="sm" />
            <Text style={styles.name}>{inverter.name}</Text>
          </View>
          {inverter.vendor ? <Text style={styles.vendor}>{inverter.vendor}</Text> : null}
        </View>
        <View style={styles.metrics}>
          {live ? (
            <AnimatedMetric value={solarKw} format={formatSolarKw} durationMs={1800} style={styles.metricValueAnimated} />
          ) : (
            <Text style={styles.metricValue}>{Math.round(inverter.solarKw)} kW</Text>
          )}
          <Text style={styles.metricLabel}>Solar</Text>
        </View>
      </View>
      <View style={styles.footer}>
        {live ? (
          <>
            <AnimatedFooterMetric label="Load" value={loadKw} format={formatLoadKw} />
            <AnimatedFooterMetric
              label="Battery"
              value={batteryPct}
              format={inverter.batteryPct != null ? formatBatteryPct : () => '—'}
            />
          </>
        ) : (
          <>
            <FooterMetric label="Load" value={`${Math.round(inverter.loadKw)} kW`} />
            <FooterMetric
              label="Battery"
              value={inverter.batteryPct != null ? `${Math.round(inverter.batteryPct)}%` : '—'}
            />
          </>
        )}
      </View>
    </CardShell>
  );
});

export function SiteInverterList({
  inverters,
  streamingLive = false,
  smooth = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>INVERTERS</Text>
      {inverters.length === 0 ? (
        <CardShell glowColor="none" borderVariant="muted">
          <Text style={styles.emptyTitle}>No inverters linked</Text>
          <Text style={styles.emptyCopy}>
            Connect hardware via Enode Link on the Dashboard tab.
          </Text>
        </CardShell>
      ) : (
        inverters.map((inverter) => (
          <InverterCard
            key={inverter.id}
            inverter={inverter}
            streamingLive={streamingLive}
            smooth={smooth}
          />
        ))
      )}
    </View>
  );
}

const AnimatedFooterMetric = memo(function AnimatedFooterMetric({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
}) {
  return (
    <View style={styles.footerMetric}>
      <AnimatedMetric value={value} format={format} durationMs={1800} style={styles.footerValueAnimated} />
      <Text style={styles.footerLabel}>{label}</Text>
    </View>
  );
});

const FooterMetric = memo(function FooterMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.footerMetric}>
      <Text style={styles.footerValue}>{value}</Text>
      <Text style={styles.footerLabel}>{label}</Text>
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
    marginBottom: Spacing.xs,
  },
  cardSpacing: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  left: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  vendor: {
    marginTop: 4,
    marginLeft: 22,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  metrics: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  metricValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.gold,
    fontVariant: ['tabular-nums'],
  },
  metricValueAnimated: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.gold,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  metricLabel: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  footerMetric: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  footerValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  footerValueAnimated: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'left',
  },
  footerLabel: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  emptyCopy: {
    marginTop: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});
