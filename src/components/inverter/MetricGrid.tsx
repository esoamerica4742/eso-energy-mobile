import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/tokens/design';
import { BatteryCell } from '@/components/inverter/cells/BatteryCell';
import { LoadCell } from '@/components/inverter/cells/LoadCell';
import { TempCell } from '@/components/inverter/cells/TempCell';
import type { BatteryMetric, LoadMetric, TempMetric } from '@/types/inverter';

type Props = {
  battery: BatteryMetric;
  load: LoadMetric;
  temp: TempMetric;
  muted?: boolean;
};

export function MetricGrid({ battery, load, temp, muted = false }: Props) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <BatteryCell battery={battery} muted={muted} />
        <LoadCell load={load} muted={muted} />
      </View>
      <View style={styles.row}>
        <TempCell temp={temp} muted={muted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
