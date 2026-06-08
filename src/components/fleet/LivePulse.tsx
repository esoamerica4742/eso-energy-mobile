import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { fleetTheme } from '@/constants/fleetTheme';

export function LivePulse() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.35, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.45, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
    );
  }, [opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: fleetTheme.colors.green,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: fleetTheme.colors.green,
  },
});
