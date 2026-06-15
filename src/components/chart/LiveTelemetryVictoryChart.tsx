import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';
import { ChartColors, Colors, Radius } from '@/tokens/design';
import type { ChartSeries } from '@/types/telemetry';

type Props = {
  series: ChartSeries[];
  yMin: number;
  yMax: number;
  height: number;
  animate?: boolean;
  faultTint?: boolean;
};

type Row = {
  idx: number;
  power: number;
  load: number;
  battery: number;
};

function seriesSignature(series: ChartSeries[]): string {
  return series
    .map((s) => `${s.id}:${s.data.length}:${s.data.at(-1)?.value ?? 0}:${s.currentValue}`)
    .join('|');
}

function toVictoryRows(series: ChartSeries[]): Row[] {
  const power = series.find((s) => s.id === 'power')?.data ?? [];
  const load = series.find((s) => s.id === 'load')?.data ?? [];
  const battery = series.find((s) => s.id === 'battery')?.data ?? [];
  const len = Math.max(power.length, load.length, battery.length, 2);

  return Array.from({ length: len }, (_, idx) => ({
    idx,
    power: power[idx]?.value ?? power.at(-1)?.value ?? 0,
    load: load[idx]?.value ?? load.at(-1)?.value ?? 0,
    battery: battery[idx]?.value ?? battery.at(-1)?.value ?? 0,
  }));
}

/** Live telemetry chart — Victory Native SVG. */
export const LiveTelemetryVictoryChart = memo(function LiveTelemetryVictoryChart({
  series,
  yMin,
  yMax,
  height,
  faultTint = false,
}: Props) {
  const signature = useMemo(() => seriesSignature(series), [series]);
  const chartData = useMemo(() => toVictoryRows(series), [series]);

  return (
    <View style={[styles.wrap, { height }, faultTint && styles.faultWrap]}>
      <VictoryChart
        width={320}
        height={height}
        domain={{ y: [yMin, yMax] }}
        padding={{ top: 12, bottom: 24, left: 36, right: 12 }}
      >
        <VictoryAxis
          style={{
            tickLabels: { fill: Colors.textMuted, fontSize: 9 },
            axis: { stroke: Colors.borderSubtle },
            grid: { stroke: Colors.borderSubtle, strokeDasharray: '3,3' },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fill: Colors.textMuted, fontSize: 9 },
            axis: { stroke: 'transparent' },
            grid: { stroke: Colors.borderSubtle, strokeDasharray: '3,3' },
          }}
        />
        <VictoryLine
          data={chartData}
          x="idx"
          y="power"
          interpolation="natural"
          style={{ data: { stroke: ChartColors.power, strokeWidth: 2 } }}
        />
        <VictoryLine
          data={chartData}
          x="idx"
          y="load"
          interpolation="natural"
          style={{ data: { stroke: ChartColors.load, strokeWidth: 1.75 } }}
        />
        <VictoryLine
          data={chartData}
          x="idx"
          y="battery"
          interpolation="natural"
          style={{ data: { stroke: ChartColors.battery, strokeWidth: 1.25 } }}
        />
      </VictoryChart>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  faultWrap: {
    borderColor: Colors.fault,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
});
