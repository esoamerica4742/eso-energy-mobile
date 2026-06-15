import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PRESS_SPRING } from '@/monitoring/auth/inverter/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Pressable with 0.75 opacity + 0.97 scale on press — use instead of TouchableOpacity. */
export function AuthPressable({ children, style, onPressIn, onPressOut, ...rest }: Props) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[animStyle, style]}
      onPressIn={(e) => {
        opacity.value = withTiming(0.75, { duration: 80 });
        scale.value = withSpring(0.97, PRESS_SPRING);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        opacity.value = withTiming(1, { duration: 120 });
        scale.value = withSpring(1, PRESS_SPRING);
        onPressOut?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
