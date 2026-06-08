import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/tokens/design';
import { SubMetricCell } from '@/components/ui/SubMetricCell';
import type { SubMetric } from '@/types/dashboard';

type Props = {
  metrics: SubMetric[];
};

export function SubMetricGrid({ metrics }: Props) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <SubMetricCell key={metric.label} metric={metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
