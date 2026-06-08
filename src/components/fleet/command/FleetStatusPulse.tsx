import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/tokens/design';
import type { FleetSite } from '@/types/fleet';

type Props = {
  status: FleetSite['status'];
  size?: 'sm' | 'md';
  reducedMotion?: boolean;
};

const STATUS_COLORS = {
  live: Colors.battery,
  degraded: Colors.warning,
  offline: Colors.alert,
} as const;

const PULSE_MS = 1400;
const PULSE_EASING = Easing.inOut(Easing.sin);

/** Calm ambient pulse — premium control-room feel, never aggressive blink. */
export const FleetStatusPulse = memo(function FleetStatusPulse({
  status,
  size = 'md',
  reducedMotion = false,
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const color = STATUS_COLORS[status];
  const dim = size === 'sm' ? 8 : 10;
  const ringDim = size === 'sm' ? 14 : 18;

  useEffect(() => {
    if (reducedMotion || status !== 'live') {
      scale.value = 1;
      opacity.value = status === 'offline' ? 0.5 : 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: PULSE_MS, easing: PULSE_EASING }),
        withTiming(1, { duration: PULSE_MS, easing: PULSE_EASING }),
      ),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.58, { duration: PULSE_MS, easing: PULSE_EASING }),
        withTiming(0.92, { duration: PULSE_MS, easing: PULSE_EASING }),
      ),
      -1,
    );
  }, [opacity, reducedMotion, scale, status]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.wrap, { width: ringDim, height: ringDim }]}>
      {status === 'live' ? (
        <Animated.View
          style={[
            styles.ring,
            ringStyle,
            { width: ringDim, height: ringDim, borderRadius: ringDim / 2, backgroundColor: color },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.dot,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: color,
            opacity: status === 'offline' ? 0.55 : 1,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  dot: {},
});
