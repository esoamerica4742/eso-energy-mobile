import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

type Props = {
  active: boolean;
};

export function OnboardingProgressDot({ active }: Props) {
  const width = useSharedValue(active ? 20 : 8);
  const opacity = useSharedValue(active ? 1 : 0.55);

  useEffect(() => {
    width.value = withTiming(active ? 20 : 8, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(active ? 1 : 0.55, { duration: 280 });
  }, [active, opacity, width]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 999,
          backgroundColor: active ? C.gold : 'rgba(255,255,255,0.18)',
        },
        style,
      ]}
    />
  );
}
