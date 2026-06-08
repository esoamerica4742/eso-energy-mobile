import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { ringColorForProgress } from '@/esopay/components/power-shield/powerShieldTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  progress: number;
  size?: number;
  dimmed?: boolean;
  animateOnMount?: boolean;
};

export const PowerShieldTokenRing = memo(function PowerShieldTokenRing({
  progress,
  size = 148,
  dimmed = false,
  animateOnMount = true,
}: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(animateOnMount ? 0 : progress);

  useEffect(() => {
    if (!animateOnMount) {
      animatedProgress.value = progress;
      return;
    }
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [animateOnMount, progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const dashOffset = circumference * (1 - animatedProgress.value);
    const color = dimmed
      ? 'rgba(255,255,255,0.12)'
      : interpolateColor(
          animatedProgress.value,
          [0, 0.55, 0.82, 1],
          ['#10B981', '#10B981', '#F59E0B', '#EF4444'],
        );
    return {
      strokeDashoffset: dashOffset,
      stroke: color,
    };
  });

  return (
    <View style={[styles.wrap, { width: size, height: size, opacity: dimmed ? 0.35 : 1 }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={dimmed ? 'rgba(255,255,255,0.12)' : ringColorForProgress(progress)}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
});
