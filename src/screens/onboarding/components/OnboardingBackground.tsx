import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  ONBOARDING_COLORS as C,
  SCREEN_HEIGHT as H,
  SCREEN_WIDTH as W,
  ONBOARDING_SLIDE_COUNT,
} from '@/screens/onboarding/theme';

function clamp01(v: number) {
  'worklet';
  return Math.max(0, Math.min(1, v));
}

function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * (W - 10),
        size: 2 + Math.random() * 2.2,
        delay: Math.random() * 2000,
        duration: 9000 + Math.random() * 5000,
        opacity: 0.2 + Math.random() * 0.35,
      })),
    [],
  );

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
}

function Particle(props: {
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}) {
  const y = useSharedValue(1);

  useEffect(() => {
    y.value = 1;
    y.value = withDelay(
      props.delay,
      withRepeat(withTiming(0, { duration: props.duration, easing: Easing.linear }), -1, false),
    );
  }, [props.delay, props.duration, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(y.value, [0, 1], [-40, H + 60]) }],
    opacity: props.opacity * 0.65,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: props.left,
          top: 0,
          width: props.size,
          height: props.size,
          borderRadius: 999,
          backgroundColor: C.gold,
        },
        style,
      ]}
    />
  );
}

function ScanLine() {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
  }, [t]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.02,
    transform: [{ translateY: interpolate(t.value, [0, 1], [-60, H + 60]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'white' },
        style,
      ]}
    />
  );
}

type Props = {
  progress: SharedValue<number>;
};

export function OnboardingBackground({ progress }: Props) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    breathe.value = 0;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [breathe]);

  const primaryGlow = useAnimatedStyle(() => {
    const p = clamp01(progress.value / (ONBOARDING_SLIDE_COUNT - 1));
    const accent = interpolateColor(p, [0, 0.5, 1], [C.tealDeep, C.green, C.blue]);
    const top = interpolate(p, [0, 0.5, 1], [H * 0.08, H * 0.58, H * 0.64]);
    return {
      opacity: 0.1 + breathe.value * 0.04,
      top,
      backgroundColor: accent as string,
      transform: [{ scale: 1.35 + breathe.value * 0.05 }],
    };
  });

  const secondaryGlow = useAnimatedStyle(() => {
    const p = clamp01(progress.value / (ONBOARDING_SLIDE_COUNT - 1));
    const accent = interpolateColor(p, [0, 0.5, 1], [C.tealDeep, C.green, C.blue]);
    return {
      opacity: 0.06 + breathe.value * 0.03,
      backgroundColor: accent as string,
      transform: [{ scale: 1.5 }],
    };
  });

  return (
    <View className="absolute inset-0" style={{ zIndex: 0 }} pointerEvents="none">
      <LinearGradient
        colors={[C.navy1, C.navy2, C.navy3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: -W * 0.35,
            width: W * 1.7,
            height: H * 0.42,
            borderRadius: 999,
          },
          primaryGlow,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: -W * 0.25,
            bottom: H * 0.06,
            width: W * 1.2,
            height: H * 0.28,
            borderRadius: 999,
          },
          secondaryGlow,
        ]}
      />
      <ParticleField />
      <ScanLine />
    </View>
  );
}
