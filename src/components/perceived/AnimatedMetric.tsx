import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { Colors, FontSize } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  value: number;
  format: (value: number) => string;
  accent?: string;
  durationMs?: number;
  style?: StyleProp<TextStyle>;
};

/** GPU-friendly interpolated metric — glides between values, never snaps. */
export const AnimatedMetric = memo(function AnimatedMetric({
  value,
  format,
  accent,
  durationMs = 1400,
  style: textStyle,
}: Props) {
  const reduced = useReducedMotion();
  const animated = useSharedValue(value);
  const [display, setDisplay] = useState(() => format(value));

  const applyDisplay = useCallback(
    (next: number) => {
      setDisplay(format(next));
    },
    [format],
  );

  useEffect(() => {
    if (reduced) {
      animated.value = value;
      setDisplay(format(value));
      return;
    }
    animated.value = withTiming(value, { duration: durationMs });
  }, [value, reduced, durationMs, animated, format]);

  useAnimatedReaction(
    () => animated.value,
    (current, prev) => {
      if (current === prev) return;
      runOnJS(applyDisplay)(current);
    },
    [applyDisplay],
  );

  const animatedStyle = useAnimatedStyle(() => ({ opacity: 1 }));

  if (reduced) {
    return (
      <Text style={[styles.value, accent ? { color: accent } : null, textStyle]}>{display}</Text>
    );
  }

  return (
    <Animated.Text
      style={[styles.value, accent ? { color: accent } : null, textStyle, animatedStyle]}
    >
      {display}
    </Animated.Text>
  );
});

const styles = StyleSheet.create({
  value: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
