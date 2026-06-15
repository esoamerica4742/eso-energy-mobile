import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { SpringEntrance } from '@/lib/motion/SpringEntrance';
import { SPRING_PRIMARY } from '@/lib/motion/springMotion';

type Props = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** Legacy fade-in block — now uses 2026 spring entrance. */
export function FadeInBlock({ children, delay = 0, style }: Props) {
  return (
    <SpringEntrance
      delay={delay}
      offsetY={16}
      scaleFrom={0.94}
      spring={SPRING_PRIMARY}
      style={style}
    >
      {children}
    </SpringEntrance>
  );
}
