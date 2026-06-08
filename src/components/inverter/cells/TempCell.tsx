import { View, StyleSheet } from 'react-native';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { Colors, Spacing } from '@/tokens/design';
import { formatInverterNumber } from '@/utils/formatMetric';
import { useDecimalCountUp } from '@/hooks/useCountUp';
import { MetricCellShell } from '@/components/inverter/shared/MetricCellShell';
import { CellLabel } from '@/components/inverter/shared/CellLabel';
import { MetricValue } from '@/components/inverter/shared/MetricValue';
import { StatusChip } from '@/components/inverter/shared/StatusChip';
import type { MetricStatus, TempMetric } from '@/types/inverter';

function getTempColor(status: MetricStatus, muted: boolean): string {
  if (muted) return Colors.textMuted;
  if (status === 'critical') return Colors.alert;
  if (status === 'high') return Colors.warning;
  return Colors.textPrimary;
}

function getStatusLabel(status: MetricStatus): string {
  if (status === 'critical') return 'Critical';
  if (status === 'high') return 'High';
  if (status === 'warning') return 'Warning';
  return 'Normal';
}

type Props = {
  temp: TempMetric;
  muted?: boolean;
};

export function TempCell({ temp, muted = false }: Props) {
  const value = useDecimalCountUp(temp.value, {
    start: temp.value,
    animate: false,
    decimals: 0,
  });

  const displayValue = muted ? '—' : formatInverterNumber(Number(value), 0);
  const valueColor =
    pendingMetricColor(displayValue, getTempColor(temp.status, muted)) ??
    getTempColor(temp.status, muted);

  return (
    <MetricCellShell accentBorder={muted ? undefined : Colors.borderSubtle}>
      <CellLabel label="Temperature" />
      <View style={styles.gapSm} />
      <MetricValue
        value={displayValue}
        unit={temp.unit}
        valueColor={valueColor}
        muted={muted}
      />
      <View style={styles.gapXs} />
      <StatusChip status={temp.status} label={getStatusLabel(temp.status)} muted={muted} />
    </MetricCellShell>
  );
}

const styles = StyleSheet.create({
  gapSm: {
    height: Spacing.sm,
  },
  gapXs: {
    height: Spacing.xs,
  },
});
