import { View, Text, StyleSheet } from 'react-native';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { formatInverterNumber } from '@/utils/formatMetric';
import { useDecimalCountUp } from '@/hooks/useCountUp';
import { MetricCellShell } from '@/components/inverter/shared/MetricCellShell';
import { CellLabel } from '@/components/inverter/shared/CellLabel';
import { MetricValue } from '@/components/inverter/shared/MetricValue';
import type { PowerMetric } from '@/types/inverter';

type Props = {
  power: PowerMetric;
  muted?: boolean;
};

export function PowerCell({ power, muted = false }: Props) {
  const start = Math.max(0, power.value - 42.7);
  const value = useDecimalCountUp(power.value, {
    start,
    duration: 1200,
    decimals: 2,
    animate: !muted && power.value !== start,
  });

  const displayValue = muted ? '—' : formatInverterNumber(Number(value), 2);
  const valueColor = pendingMetricColor(displayValue, muted ? Colors.textMuted : Colors.gold) ?? Colors.gold;

  return (
    <MetricCellShell accentBorder={muted ? undefined : Colors.goldBorder}>
      <CellLabel label="Power" accent={muted ? undefined : Colors.gold} />
      <View style={styles.gapSm} />
      <MetricValue
        value={displayValue}
        unit={power.unit}
        valueColor={valueColor}
        unitColor={muted ? valueColor : Colors.goldSoft}
        muted={muted}
      />
      <View style={styles.gapXs} />
      <Text style={[styles.sublabel, muted && styles.sublabelMuted]}>{power.label}</Text>
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
  sublabel: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  sublabelMuted: {
    opacity: 0.7,
  },
});
