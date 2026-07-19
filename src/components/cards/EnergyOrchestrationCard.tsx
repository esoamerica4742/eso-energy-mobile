import { View, Text, StyleSheet } from 'react-native';
import { PulseStatusBadge } from '@/components/monitoring/WaitingStateMotion';
import { CardShell } from '@/components/cards/CardShell';
import { TopologyNode } from '@/components/ui/TopologyNode';
import { TopologyConnector } from '@/components/ui/TopologyConnector';
import { BatteryBar } from '@/components/ui/BatteryBar';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { formatTopologyPowerKw } from '@/lib/monitoring/gridIntelligenceSimulation';
import type { BatteryData, ConnectionStatus, TopologyNode as TopologyNodeData } from '@/types/dashboard';

type Props = {
  title?: string;
  subLabel: string;
  nodes: TopologyNodeData[];
  battery: BatteryData;
  connectionStatus?: ConnectionStatus;
  /** Forces live topology animation and kW readouts for product demonstration. */
  simulationActive?: boolean;
};

function borderVariantForStatus(status?: ConnectionStatus) {
  if (status === 'stale') return 'amber' as const;
  if (status === 'fault') return 'alert' as const;
  if (status === 'offline') return 'muted' as const;
  return 'gold' as const;
}

function statusMeta(status: ConnectionStatus) {
  if (status === 'live') {
    return {
      label: 'LIVE',
      accent: '#FFFFFF',
      bg: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.22)',
    };
  }
  if (status === 'stale') {
    return { label: 'STALE', accent: Colors.warning, bg: Colors.warningWhisper, border: Colors.warningBorder };
  }
  if (status === 'fault') {
    return { label: 'FAULT', accent: Colors.alert, bg: Colors.alertMuted, border: Colors.alertBorder };
  }
  return { label: 'OFFLINE', accent: Colors.textMuted, bg: Colors.surfaceRaised, border: Colors.borderSubtle };
}

function FlowCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const color = pendingMetricColor(value, accent ?? Colors.textPrimary);
  return (
    <View style={styles.flowCell}>
      <Text style={[styles.flowValue, { color }]}>{value}</Text>
      <Text style={styles.flowLabel}>{label}</Text>
    </View>
  );
}

function flowAccent(role: 'solar' | 'inverter' | 'grid', status: TopologyNodeData['status']) {
  if (status === 'warning') return Colors.warning;
  if (status !== 'active') return Colors.textMuted;
  if (role === 'grid') return Colors.grid;
  if (role === 'solar') return Colors.gold;
  return '#FFFFFF';
}

function flowCellValue(node: TopologyNodeData | undefined): string {
  if (!node) return '—';
  if (node.powerKw != null) return formatTopologyPowerKw(node.powerKw);
  return node.flowLabel ?? node.status.toUpperCase();
}

export function EnergyOrchestrationCard({
  title,
  subLabel,
  nodes,
  battery,
  connectionStatus = 'live',
  simulationActive = false,
}: Props) {
  const [left, center, right] = nodes;
  const effectiveStatus: ConnectionStatus = simulationActive ? 'live' : connectionStatus;
  const meta = statusMeta(effectiveStatus);
  const flowing = effectiveStatus === 'live';

  return (
    <CardShell glowColor="none" borderVariant={borderVariantForStatus(effectiveStatus)} style={styles.shell}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>ENERGY ORCHESTRATION</Text>
        <PulseStatusBadge
          label={meta.label}
          accent={meta.accent}
          bg={meta.bg}
          border={meta.border}
          badgeStyle={styles.statusBadge}
          textStyle={styles.statusText}
        />
      </View>

      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={[styles.subLabel, !title && styles.subLabelFirst]}>{subLabel}</Text>

      <View style={styles.topologyPanel}>
        <View style={styles.topologyRow}>
          {left ? <TopologyNode node={left} /> : null}
          <TopologyConnector energyFlowing={flowing} flowDelayMs={0} style={styles.connector} />
          {center ? <TopologyNode node={center} /> : null}
          <TopologyConnector
            energyFlowing={flowing}
            flowDelayMs={flowing ? 1100 : 0}
            style={styles.connector}
          />
          {right ? <TopologyNode node={right} /> : null}
        </View>
      </View>

      <View style={styles.reservePanel}>
        <BatteryBar battery={battery} />
      </View>

      <View style={styles.flowGrid}>
        <FlowCell label="Solar" value={flowCellValue(left)} accent={left ? flowAccent('solar', left.status) : undefined} />
        <View style={styles.divider} />
        <FlowCell label="Inverter" value={flowCellValue(center)} accent={center ? flowAccent('inverter', center.status) : undefined} />
        <View style={styles.divider} />
        <FlowCell label="Grid" value={flowCellValue(right)} accent={right ? flowAccent('grid', right.status) : undefined} />
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: MonitoringLayout.cardMarginH,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  subLabelFirst: {
    marginTop: 0,
  },
  subLabel: {
    marginTop: 4,
    marginBottom: Spacing.md,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    letterSpacing: 1.4,
    color: Colors.gold,
    textTransform: 'uppercase',
  },
  topologyPanel: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    marginBottom: Spacing.md,
  },
  topologyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  connector: {
    flex: 1,
    alignSelf: 'center',
    marginTop: 28,
    minWidth: 8,
    maxWidth: 48,
  },
  reservePanel: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    marginBottom: Spacing.md,
  },
  flowGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.md,
  },
  flowCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  flowValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  flowLabel: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.micro,
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
