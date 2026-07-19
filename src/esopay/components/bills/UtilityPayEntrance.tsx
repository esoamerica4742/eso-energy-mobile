import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type Props = {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
};

/** Quiet staggered entrance for utility pay blocks. */
export function UtilityPayEntrance({ children, index = 0, style }: Props) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <View style={style}>{children}</View>;
  }
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 55)
        .springify()
        .damping(20)
        .stiffness(220)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
