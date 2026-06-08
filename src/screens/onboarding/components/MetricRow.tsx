import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

type Props = {
  label: string;
  value: string;
  color: string;
  fill: number;
  delayMs: number;
};

export function MetricRow({ label, value, color, fill, delayMs }: Props) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = 0;
    w.value = withDelay(
      delayMs,
      withTiming(fill, { duration: 850, easing: Easing.out(Easing.cubic) }),
    );
  }, [delayMs, fill, w]);

  const barStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View className="flex-row items-center justify-between gap-4 py-2">
      <View className="flex-1 flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <Text className="text-[15px] font-jakarta" style={{ color: C.muted }}>
          {label}
        </Text>
      </View>
      <View className="w-[48%]">
        <View
          className="h-2 overflow-hidden rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          <Animated.View className="h-2 rounded-full" style={[{ backgroundColor: color }, barStyle]} />
        </View>
        <Text className="mt-1 text-right text-[15px] font-jakarta-medium" style={{ color: C.text }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
