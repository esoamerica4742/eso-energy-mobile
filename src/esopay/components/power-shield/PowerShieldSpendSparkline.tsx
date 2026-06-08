import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { PS } from '@/esopay/components/power-shield/powerShieldTheme';

type Props = {
  values?: number[];
  width?: number;
  height?: number;
};

function defaultSevenDaySpend(dailyKobo: number): number[] {
  const base = dailyKobo / 100;
  const jitter = [0.92, 1.04, 0.98, 1.08, 0.95, 1.02, 1];
  return jitter.map((m) => Math.round(base * m));
}

export const PowerShieldSpendSparkline = memo(function PowerShieldSpendSparkline({
  values,
  width = 320,
  height = 56,
}: Props) {
  const points = useMemo(() => {
    const data = values && values.length >= 2 ? values : defaultSevenDaySpend(74_000);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(max - min, 1);
    const step = width / (data.length - 1);
    return data
      .map((value, index) => {
        const x = index * step;
        const y = height - ((value - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');
  }, [values, width, height]);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={PS.gold}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    opacity: 0.95,
  },
});
