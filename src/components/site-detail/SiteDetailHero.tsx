import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { AnimatedMetric } from '@/components/perceived/AnimatedMetric';
import { PerceivedMiniSparkline } from '@/components/perceived/PerceivedMiniSparkline';
import { sourceLabel } from '@/lib/siteDetailData';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { FleetSite } from '@/types/fleet';

type Props = {
  site: FleetSite;
  streamingLive?: boolean;
  smooth?: boolean;
  sparklineSeed?: number[];
};

function formatLoadValue(load: number) {
  if (load >= 1000) return `${(load / 1000).toFixed(1)}`;
  return `${Math.round(load)}`;
}

function loadUnit(load: number) {
  return load >= 1000 ? 'MW' : 'kW';
}

function formatBatteryPct(v: number) {
  return `${Math.round(v)}%`;
}

function mapSourceBadge(source: FleetSite['source']) {
  if (source === 'warning') return 'warning' as const;
  if (source === 'offline') return 'offline' as const;
  if (source === 'diesel') return 'diesel' as const;
  if (source === 'grid') return 'grid' as const;
  return 'solar' as const;
}

export const SiteDetailHero = memo(function SiteDetailHero({
  site,
  streamingLive = false,
  smooth = true,
  sparklineSeed = site.sparklineTrend,
}: Props) {
  const borderVariant =
    site.status === 'degraded' ? 'amber' : site.status === 'offline' ? 'muted' : 'gold';
  const showAnimated = streamingLive && site.status === 'live';

  return (
    <CardShell glowColor={site.status === 'live' ? 'mint' : 'gold'} borderVariant={borderVariant}>
      <View style={styles.topRow}>
        <StatusBadge status={mapSourceBadge(site.source)} />
        <Text style={styles.sourceCopy}>{sourceLabel(site.source)}</Text>
      </View>

      <View style={styles.loadRow}>
        <View style={styles.loadBlock}>
          {showAnimated ? (
            <Text style={styles.loadValue}>
              <AnimatedMetric
                value={site.load}
                format={formatLoadValue}
                durationMs={1800}
                style={styles.loadValueAnimated}
              />
              <Text style={styles.loadUnit}> {loadUnit(site.load)}</Text>
            </Text>
          ) : (
            <Text style={styles.loadValue}>
              {formatLoadValue(site.load)}
              <Text style={styles.loadUnit}> {loadUnit(site.load)}</Text>
            </Text>
          )}
          <Text style={styles.loadLabel}>Current load draw</Text>
        </View>
        <View style={styles.sparkWrap}>
          <PerceivedMiniSparkline
            metricValue={site.load}
            seed={sparklineSeed}
            streaming={showAnimated}
            smooth={smooth}
            status={site.status}
            width={96}
            height={36}
          />
        </View>
      </View>

      <View style={styles.metaGrid}>
        {showAnimated ? (
          <AnimatedMetaCell label="Battery" value={site.battery} format={formatBatteryPct} />
        ) : (
          <MetaCell label="Battery" value={`${site.battery}%`} />
        )}
        <MetaCell label="Uptime" value={`${site.uptime}%`} />
        <MetaCell label="Inverters" value={`${site.onlineInverters}/${site.inverterCount}`} />
      </View>

      {site.lastSeenLabel ? (
        <Text style={styles.lastSeen}>Last telemetry {site.lastSeenLabel}</Text>
      ) : null}
    </CardShell>
  );
});

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

function AnimatedMetaCell({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
}) {
  return (
    <View style={styles.metaCell}>
      <AnimatedMetric value={value} format={format} durationMs={1800} style={styles.metaValueAnimated} />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sourceCopy: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  loadRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  loadBlock: {
    flex: 1,
  },
  sparkWrap: {
    paddingBottom: 4,
  },
  loadValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.hero,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  loadValueAnimated: {
    fontFamily: fonts.bold,
    fontSize: FontSize.hero,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    textAlign: 'left',
  },
  loadUnit: {
    fontFamily: fonts.regular,
    fontSize: FontSize.sub,
    color: Colors.textSecondary,
  },
  loadLabel: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metaGrid: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  metaCell: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  metaValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  metaValueAnimated: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'left',
  },
  metaLabel: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  lastSeen: {
    marginTop: Spacing.md,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});
