import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '@/theme/tokens';

export function usePressAnimation(baseBg = colors.bgSurface) {
  const scale = useSharedValue(1);
  const bg = useSharedValue(baseBg);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: bg.value,
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.985, { damping: 20 });
    bg.value = colors.bgElevated;
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 20 });
    bg.value = baseBg;
  };

  return { style, onPressIn, onPressOut };
}
