import { View, Text, StyleSheet } from 'react-native';
import { PulseStatusBadge } from '@/components/monitoring/WaitingStateMotion';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { CardShell } from '@/components/cards/CardShell';
import { MetricGrid } from '@/components/inverter/MetricGrid';
import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { formatInverterNumber } from '@/utils/formatMetric';
import { useDecimalCountUp } from '@/hooks/useCountUp';
import type { InverterData } from '@/types/inverter';
import type { ConnectionStatus } from '@/types/dashboard';

type Props = {
  inverter: InverterData;
};

function borderVariantForStatus(status: ConnectionStatus) {
  if (status === 'stale') return 'amber' as const;
  if (status === 'fault') return 'alert' as const;
  if (status === 'offline') return 'muted' as const;
  return 'gold' as const;
}

function statusMeta(status: ConnectionStatus, live: boolean) {
  if (!live) {
    return {
      label: 'PAUSED',
      accent: Colors.warning,
      bg: Colors.warningWhisper,
      border: Colors.warningBorder,
    };
  }
  if (status === 'live') {
    return { label: 'LIVE', accent: Colors.mint, bg: Colors.mintGlow, border: Colors.mintBorder };
  }
  if (status === 'stale') {
    return { label: 'STALE', accent: Colors.warning, bg: Colors.warningWhisper, border: Colors.warningBorder };
  }
  if (status === 'fault') {
    return { label: 'FAULT', accent: Colors.alert, bg: Colors.alertMuted, border: Colors.alertBorder };
  }
  return { label: 'OFFLINE', accent: Colors.textMuted, bg: Colors.surfaceRaised, border: Colors.borderSubtle };
}

export function InverterCard({ inverter }: Props) {
  const connectionStatus = inverter.connectionStatus ?? (inverter.isLive ? 'live' : 'offline');
  const live = inverter.isLive && connectionStatus === 'live';
  const meta = statusMeta(connectionStatus, live);

  const powerStart = Math.max(0, inverter.power.value - 42.7);
  const powerValue = useDecimalCountUp(inverter.power.value, {
    start: powerStart,
    duration: 1200,
    decimals: 2,
    animate: live && inverter.power.value !== powerStart,
  });

  const powerColor = live ? Colors.gold : Colors.pendingValue;

  return (
    <CardShell glowColor="none" borderVariant={borderVariantForStatus(connectionStatus)} style={styles.shell}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>INVERTER INTELLIGENCE</Text>
        <PulseStatusBadge
          label={meta.label}
          accent={meta.accent}
          bg={meta.bg}
          border={meta.border}
          badgeStyle={styles.statusBadge}
          textStyle={styles.statusText}
        />
      </View>

      <Text style={styles.sectionLabel}>
        {(inverter.site?.trim() || 'Fleet site').toUpperCase()} · PRIMARY UNIT
      </Text>

      <View style={styles.heroPanel}>
        <Text style={styles.heroLabel}>{inverter.power.label.toUpperCase()}</Text>
        <View style={styles.heroValueRow}>
          <Text
            style={[styles.heroValue, { color: powerColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {live ? formatInverterNumber(Number(powerValue), 2) : '—'}
          </Text>
          <Text
            style={[
              styles.heroUnit,
              { color: live ? Colors.goldSoft : pendingMetricColor('—', Colors.pendingValue) },
            ]}
          >
            {inverter.power.unit}
          </Text>
        </View>
      </View>

      <Text style={styles.breakdownLabel}>TELEMETRY BREAKDOWN</Text>
      <MetricGrid
        battery={inverter.battery}
        load={inverter.load}
        temp={inverter.temp}
        muted={!live}
      />
    </CardShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: MonitoringLayout.cardMarginH,
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  eyebrow: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1,
  },
  heroPanel: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    marginBottom: Spacing.md,
  },
  heroLabel: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  heroValue: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: FontSize.hero,
    letterSpacing: -1.2,
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
  },
  heroUnit: {
    fontFamily: fonts.bold,
    fontSize: FontSize.unit,
    lineHeight: 44,
    paddingBottom: 4,
  },
  breakdownLabel: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
