/**
 * Animated numeric value — smoothly interpolates when telemetry updates.
 * Uses a Reanimated derived value displayed via a plain Text update.
 */
import { useCallback, useEffect, useState } from 'react';
import { Text, type TextStyle } from 'react-native';
import {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

type Props = {
  value: number;
  formatFn?: (v: number) => string;
  style?: TextStyle;
  spring?: boolean;
};

export function LiveMetricValue({
  value,
  formatFn = (v) => v.toFixed(1),
  style,
  spring = false,
}: Props) {
  const sv = useSharedValue(value);
  const [display, setDisplay] = useState(() => formatFn(value));

  const applyDisplay = useCallback(
    (next: number) => {
      setDisplay(formatFn(next));
    },
    [formatFn],
  );

  useEffect(() => {
    if (spring) {
      sv.value = withSpring(value, { damping: 18, stiffness: 80 });
    } else {
      sv.value = withTiming(value, { duration: 500 });
    }
  }, [value, sv, spring]);

  useAnimatedReaction(
    () => sv.value,
    (current) => {
      runOnJS(applyDisplay)(current);
    },
    [applyDisplay],
  );

  return <Text style={[{ fontVariant: ['tabular-nums'] }, style]}>{display}</Text>;
}
