import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import * as Haptics from 'expo-haptics';
import { motionSpring } from '@/lib/motion/presets';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type Props = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: 'light' | 'medium' | 'selection' | 'none';
  scaleTo?: number;
};

/** Framer Motion–style press feedback with optional haptics */
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

  if (reduced) {
    return (
      <Pressable
        style={style}
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

  return (
    <MotiPressable
      style={style}
      disabled={disabled ?? undefined}
      animate={({ pressed }) => ({
        scale: pressed ? scaleTo : 1,
        opacity: pressed ? 0.92 : 1,
      })}
      transition={motionSpring.snappy}
      onPress={() => {
        fireHaptic();
        if (onPress) (onPress as () => void)();
      }}
    >
      {children}
    </MotiPressable>
  );
}
