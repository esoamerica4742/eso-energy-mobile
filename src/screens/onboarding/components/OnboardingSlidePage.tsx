import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { OnboardingSlideContent } from '@/screens/onboarding/slides';
import type { OnboardingSlide } from '@/screens/onboarding/slides';
import { SCREEN_WIDTH as W } from '@/screens/onboarding/theme';

type Props = {
  slide: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
};

export function OnboardingSlidePage({ slide, index, scrollX }: Props) {
  const animatedStyle = useAnimatedStyle(() => {
    const center = index * W;
    return {
      opacity: interpolate(
        scrollX.value,
        [center - W, center, center + W],
        [0.45, 1, 0.45],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            [center - W, center, center + W],
            [28, 0, -28],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width: W }} className="px-5 pt-10">
      <Animated.View style={animatedStyle}>
        <OnboardingSlideContent slide={slide} />
      </Animated.View>
    </View>
  );
}
