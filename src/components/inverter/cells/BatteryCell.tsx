import { View, Text, StyleSheet } from 'react-native';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { formatInverterNumber } from '@/utils/formatMetric';
import { useDecimalCountUp } from '@/hooks/useCountUp';
import { MetricCellShell } from '@/components/inverter/shared/MetricCellShell';
import { CellLabel } from '@/components/inverter/shared/CellLabel';
import { MetricValue } from '@/components/inverter/shared/MetricValue';
import { StatusChip } from '@/components/inverter/shared/StatusChip';
import type { BatteryMetric, MetricStatus } from '@/types/inverter';

function getBatteryColor(pct: number, muted: boolean): string {
  if (muted) return Colors.textMuted;
  if (pct <= 10) return Colors.alert;
  if (pct <= 30) return Colors.warning;
  return Colors.mint;
}

function getStatusLabel(status: MetricStatus): string {
  if (status === 'critical') return 'Critical';
  if (status === 'low') return 'Low';
  if (status === 'normal') return 'Normal';
  if (status === 'high') return 'High';
  if (status === 'warning') return 'Warning';
  return status;
}

type Props = {
  battery: BatteryMetric;
  muted?: boolean;
};

export function BatteryCell({ battery, muted = false }: Props) {
  const value = useDecimalCountUp(battery.percentage, {
    start: battery.percentage,
    animate: false,
    decimals: 0,
  });
  const rawAccent = getBatteryColor(battery.percentage, muted);
  const displayValue = muted ? '—' : formatInverterNumber(Number(value), 0);
  const accent = pendingMetricColor(displayValue, rawAccent) ?? rawAccent;
  const fill = muted ? 0 : Math.max(0, Math.min(100, battery.percentage));

  return (
    <MetricCellShell accentBorder={muted ? undefined : Colors.borderSubtle}>
      <CellLabel label="Battery" />
      <View style={styles.spacer} />
      <MetricValue
        value={displayValue}
        unit="%"
        valueColor={accent}
        muted={muted}
      />
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${fill}%`, backgroundColor: accent }]} />
      </View>
      <View style={styles.gapSm} />
      <StatusChip status={battery.status} label={getStatusLabel(battery.status)} muted={muted} />
    </MetricCellShell>
  );
}

const styles = StyleSheet.create({
  spacer: {
    flex: 1,
    minHeight: Spacing.sm,
  },
  barTrack: {
    marginTop: Spacing.sm,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  gapSm: {
    height: Spacing.sm,
  },
});
