import { View, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

const ENTRANCE_MS = 600;
const LUXURY_EASE = Easing.bezier(0.22, 1, 0.36, 1);

type Props = {
  children: React.ReactNode;
  delay?: number;
  from?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  style?: StyleProp<ViewStyle>;
};

export function AccessEntrance({ children, delay = 0, from, animate, style }: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <View style={style}>{children}</View>;
  }

  return (
    <MotiView
      from={from}
      animate={animate}
      transition={{ type: 'timing', duration: ENTRANCE_MS, easing: LUXURY_EASE, delay }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
