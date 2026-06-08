import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { formatInverterNumber } from '@/utils/formatMetric';
import { useDecimalCountUp } from '@/hooks/useCountUp';
import { MetricCellShell } from '@/components/inverter/shared/MetricCellShell';
import { CellLabel } from '@/components/inverter/shared/CellLabel';
import { MetricValue } from '@/components/inverter/shared/MetricValue';
import { SignalBars } from '@/components/inverter/shared/SignalBars';
import type { LoadMetric } from '@/types/inverter';

type Props = {
  load: LoadMetric;
  muted?: boolean;
};

export function LoadCell({ load, muted = false }: Props) {
  const start = Math.max(0, load.value - 45.5);
  const value = useDecimalCountUp(load.value, {
    start,
    duration: 1200,
    decimals: 1,
    animate: !muted && load.value !== start,
  });

  return (
    <MetricCellShell>
      <View style={styles.headerRow}>
        <CellLabel label="Load" />
        {!muted ? <SignalBars level={load.signalLevel} inline /> : null}
      </View>
      <View style={styles.gapSm} />
      <MetricValue
        value={muted ? '—' : formatInverterNumber(Number(value), 1)}
        unit={load.unit}
        valueColor={muted ? Colors.textMuted : Colors.textPrimary}
        unitColor={muted ? Colors.textMuted : Colors.textSecondary}
        muted={muted}
      />
      <View style={styles.gapXs} />
      <Text style={[styles.sublabel, muted && styles.sublabelMuted]}>{load.label}</Text>
    </MetricCellShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  gapSm: {
    height: Spacing.sm,
  },
  gapXs: {
    height: Spacing.xs,
  },
  sublabel: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  sublabelMuted: {
    color: Colors.textMuted,
    opacity: 0.7,
  },
});
