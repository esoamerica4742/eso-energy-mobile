import { View, Text, StyleSheet } from 'react-native';
import { PulseStatusBadge } from '@/components/monitoring/WaitingStateMotion';
import { CardShell } from '@/components/cards/CardShell';
import { KPINumber } from '@/components/typography/KPINumber';
import { LiveBadge } from '@/components/ui/LiveBadge';
import { SubMetricGrid } from '@/components/ui/SubMetricGrid';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { ConnectionStatus, KPISavingsData } from '@/types/dashboard';

type Props = {
  kpi: KPISavingsData;
  connectionStatus?: ConnectionStatus;
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

export function KPISavingsCard({ kpi, connectionStatus = 'live' }: Props) {
  const live = connectionStatus === 'live';

  const meta = statusMeta(connectionStatus, live);

  return (
    <CardShell glowColor="none" borderVariant={borderVariantForStatus(connectionStatus)} style={styles.shell}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>NET DAILY SAVINGS</Text>
        <PulseStatusBadge
          label={meta.label}
          accent={meta.accent}
          bg={meta.bg}
          border={meta.border}
          badgeStyle={styles.statusBadge}
          textStyle={styles.statusText}
        />
      </View>

      <Text style={styles.sectionLabel}>{kpi.sectionLabel}</Text>
      <Text style={[styles.description, !live && styles.descriptionMuted]}>{kpi.description}</Text>

      <View style={styles.heroPanel}>
        <Text style={styles.heroLabel}>TODAY</Text>
        <KPINumber currency={kpi.currency} value={kpi.primaryValue} muted={!live} />
      </View>

      <View style={styles.deltaWrap}>
        <LiveBadge
          delta={kpi.delta}
          label={kpi.deltaLabel}
          direction={kpi.deltaDirection}
          muted={!live}
        />
      </View>

      <Text style={styles.breakdownLabel}>PERFORMANCE BREAKDOWN</Text>
      <SubMetricGrid metrics={kpi.subMetrics} />
    </CardShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
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
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  descriptionMuted: {
    color: Colors.textMuted,
  },
  heroPanel: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
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
  deltaWrap: {
    marginBottom: Spacing.md,
  },
  breakdownLabel: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
