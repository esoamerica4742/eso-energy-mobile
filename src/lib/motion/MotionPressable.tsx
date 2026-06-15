import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type Props = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: 'light' | 'medium' | 'selection' | 'none';
  scaleTo?: number;
};

/** Press feedback without Moti — MotiPressable crashes on Reanimated 4 worklets. */
export function MotionPressable({
  children,
  style,
  haptic = 'light',
  scaleTo = 0.975,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: Props) {
  const reduced = useReducedMotion();

  const fireHaptic = () => {
    if (disabled || haptic === 'none') return;
    if (haptic === 'selection') void Haptics.selectionAsync();
    else if (haptic === 'medium') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        style,
        !reduced && !disabled && pressed
          ? { transform: [{ scale: scaleTo }], opacity: 0.92 }
          : null,
      ]}
      disabled={disabled ?? undefined}
      onPress={(e) => {
        fireHaptic();
        onPress?.(e);
      }}
      onPressIn={onPressIn ?? undefined}
      onPressOut={onPressOut ?? undefined}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
