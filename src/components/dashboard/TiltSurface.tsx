import { type ReactNode, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  maxTiltDeg?: number;
  ambientEnabled?: boolean;
  reducedMotion?: boolean;
  gestureEnabled?: boolean;
};

export function TiltSurface({
  children,
  style,
  maxTiltDeg = 6,
  ambientEnabled = true,
  reducedMotion = false,
  gestureEnabled = false,
}: Props) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const gx = useSharedValue(0);
  const gy = useSharedValue(0);
  const scale = useSharedValue(1);
  const pan = Gesture.Pan()
    .enabled(gestureEnabled)
    .minDistance(10)
    .onBegin(() => {
      scale.value = withSpring(reducedMotion ? 1.003 : 1.015, { damping: 20, stiffness: 220 });
    })
    .onUpdate((e) => {
      if (reducedMotion) return;
      const nx = Math.max(-1, Math.min(1, e.translationX / 65));
      const ny = Math.max(-1, Math.min(1, e.translationY / 65));
      tx.value = nx * maxTiltDeg;
      ty.value = ny * maxTiltDeg;
    })
    .onFinalize(() => {
      tx.value = withSpring(0, { damping: 16, stiffness: 190 });
      ty.value = withSpring(0, { damping: 16, stiffness: 190 });
      scale.value = withSpring(1, { damping: 16, stiffness: 190 });
    });

  useEffect(() => {
    if (!ambientEnabled || reducedMotion) {
      gx.value = withTiming(0, { duration: 220 });
      gy.value = withTiming(0, { duration: 220 });
      return;
    }

    Accelerometer.setUpdateInterval(90);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      const sx = Math.max(-1, Math.min(1, x));
      const sy = Math.max(-1, Math.min(1, y));
      gx.value = withTiming(sx * maxTiltDeg * 0.38, { duration: 140 });
      gy.value = withTiming(sy * maxTiltDeg * 0.38, { duration: 140 });
    });

    return () => subscription.remove();
  }, [ambientEnabled, reducedMotion, gx, gy, maxTiltDeg]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${tx.value + gx.value}deg` },
      { rotateX: `${-(ty.value + gy.value)}deg` },
      { scale: scale.value },
    ],
  }));

  if (!gestureEnabled) {
    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }

  return <GestureDetector gesture={pan}><Animated.View style={[animatedStyle, style]}>{children}</Animated.View></GestureDetector>;
}
