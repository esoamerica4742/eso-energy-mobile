import { StyleSheet, Text, View } from 'react-native';
import { fleetTheme } from '@/constants/fleetTheme';
import { fonts } from '@/theme/tokens';
import type { FleetSummary } from '@/types/fleet';

type Props = {
  summary: FleetSummary;
};

export function FleetSummaryStrip({ summary }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.item}>
        ⚡ {formatKw(summary.totalLoadKw)}
      </Text>
      <Text style={styles.sep}>·</Text>
      <Text style={styles.item}>🔋 {summary.avgBatteryPct}%</Text>
      <Text style={styles.sep}>·</Text>
      <Text style={styles.item}>
        ✓ {summary.healthySites}/{summary.siteCount} Sites
      </Text>
    </View>
  );
}

function formatKw(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}MW`;
  return `${Math.round(value)}kW`;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: fleetTheme.spacing.sm,
  },
  item: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: fleetTheme.colors.text1,
  },
  sep: {
    color: fleetTheme.colors.text3,
    fontSize: 13,
  },
});
