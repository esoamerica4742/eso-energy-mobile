import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  SPRING_CARD,
  SPRING_PRIMARY,
  SPRING_SUBTLE,
  useSpringEntrance,
  type SpringEntranceOptions,
} from '@/lib/motion/springMotion';

type Props = SpringEntranceOptions & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SpringEntrance({ children, style, ...options }: Props) {
  const animStyle = useSpringEntrance(options);
  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}

export { SPRING_CARD, SPRING_PRIMARY, SPRING_SUBTLE };
