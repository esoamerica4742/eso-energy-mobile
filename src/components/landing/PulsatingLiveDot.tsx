import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const TEAL = '#00E5FF';

export function PulsatingLiveDot() {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.35, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
    );
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.45, { duration: 900 })),
      -1,
    );
  }, [scale, glow]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: glow.value,
    backgroundColor: TEAL,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + glow.value * 0.15,
  }));

  return (
    <View className="h-3 w-3 items-center justify-center">
      <Animated.View style={ringStyle} className="absolute h-3 w-3 rounded-full" />
      <Animated.View style={coreStyle} className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
    </View>
  );
}
