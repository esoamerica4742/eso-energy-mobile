import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Shield } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PS, arcColorForMeter } from '@/esopay/components/power-shield/powerShieldTheme';
import type { PowerShieldMeter } from '@/esopay/api/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 160;
const SHIELD = 44;
const ARC_STROKE = 7;
const DASH_STROKE = 2;
const ARC_RADIUS = (SIZE - ARC_STROKE) / 2 - 4;
const DASH_RADIUS = ARC_RADIUS + 10;

type Props = {
  active: boolean;
  remaining: number;
  meter?: PowerShieldMeter | null;
  animateArc?: boolean;
};

export const PowerShieldShieldGauge = memo(function PowerShieldShieldGauge({
  active,
  remaining,
  meter,
  animateArc = true,
}: Props) {
  const rotation = useSharedValue(0);
  const arcProgress = useSharedValue(animateArc ? 0 : remaining);
  const circumference = 2 * Math.PI * ARC_RADIUS;
  const dashCirc = 2 * Math.PI * DASH_RADIUS;
  const arcColor = active ? arcColorForMeter(meter) : PS.inactive;

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  useEffect(() => {
    arcProgress.value = withTiming(remaining, {
      duration: animateArc ? 600 : 0,
      easing: Easing.out(Easing.cubic),
    });
  }, [animateArc, remaining, arcProgress]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - arcProgress.value),
  }));

  const dashLength = dashCirc * 0.14;
  const dashGap = dashCirc * 0.06;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.dashLayer, spinStyle]}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={DASH_RADIUS}
            stroke={active ? PS.amber : PS.inactive}
            strokeWidth={DASH_STROKE}
            strokeOpacity={active ? 0.55 : 0.25}
            fill="none"
            strokeDasharray={`${dashLength} ${dashGap}`}
          />
        </Svg>
      </Animated.View>

      <Svg width={SIZE} height={SIZE} style={styles.arcLayer}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={ARC_RADIUS}
          stroke={PS.track}
          strokeWidth={ARC_STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={ARC_RADIUS}
          stroke={arcColor}
          strokeWidth={ARC_STROKE}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
          animatedProps={arcProps}
        />
      </Svg>

      <View
        style={[
          styles.shieldCore,
          active ? styles.shieldCoreActive : styles.shieldCoreInactive,
        ]}
      >
        <Shield
          size={SHIELD}
          color={active ? PS.amber : PS.inactive}
          strokeWidth={2.2}
          fill={active ? 'rgba(245, 166, 35, 0.12)' : 'rgba(85, 85, 85, 0.15)'}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcLayer: {
    position: 'absolute',
  },
  shieldCore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  shieldCoreActive: {
    borderColor: 'rgba(245, 166, 35, 0.35)',
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    shadowColor: PS.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  shieldCoreInactive: {
    borderColor: 'rgba(85, 85, 85, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});
