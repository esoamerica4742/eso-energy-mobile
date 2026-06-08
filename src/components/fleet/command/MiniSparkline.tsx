import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Colors } from '@/tokens/design';
import type { FleetSite } from '@/types/fleet';

type Props = {
  values: number[];
  status: FleetSite['status'];
  width?: number;
  height?: number;
};

const STROKE = {
  live: Colors.mint,
  degraded: Colors.gold,
  offline: Colors.textMuted,
} as const;

export const MiniSparkline = memo(function MiniSparkline({
  values,
  status,
  width = 72,
  height = 32,
}: Props) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const step = width / (values.length - 1);

  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={[styles.wrap, { width, height }]} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={STROKE[status]}
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    opacity: 0.95,
  },
});
