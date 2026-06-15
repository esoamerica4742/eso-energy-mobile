import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { PowerShieldMeter } from '@/esopay/api/types';
import { countdownProgress, formatCapacityPct } from '@/esopay/lib/powerShieldUi';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  meter: PowerShieldMeter;
  size?: number;
  tone: string;
};

export const PowerShieldCountdownRing = memo(function PowerShieldCountdownRing({
  meter,
  size = 96,
  tone,
}: Props) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = countdownProgress(meter);
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text
          style={[styles.time, { color: tone }]}
        >{formatCapacityPct(meter.volume_remaining_pct ?? meter.capacity_remaining_pct)}</Text>
        <Text style={styles.caption}>remaining</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.ui,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  },
});
