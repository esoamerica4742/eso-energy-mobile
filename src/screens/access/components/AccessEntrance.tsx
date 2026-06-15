import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { buildReanimatedEntering } from '@/lib/motion/reanimatedEntrance';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type Props = {
  children: ReactNode;
  delay?: number;
  from?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  style?: StyleProp<ViewStyle>;
};

export function AccessEntrance({ children, delay = 0, from, style }: Props) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <View style={style}>{children}</View>;
  }

  const translateY = typeof from?.translateY === 'number' ? from.translateY : 0;
  const variant =
    translateY < 0 ? 'fadeInDown' : translateY > 0 ? 'fadeInUp' : 'fadeIn';

  return (
    <Animated.View
      entering={buildReanimatedEntering(variant, delay, from)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
