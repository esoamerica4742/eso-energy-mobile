import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { MotionVariantName } from '@/lib/motion/presets';
import { motionVariants, staggerDelay } from '@/lib/motion/presets';
import {
  SPRING_CARD,
  SPRING_PRIMARY,
  SPRING_SUBTLE,
} from '@/lib/motion/springMotion';
import { SpringEntrance } from '@/lib/motion/SpringEntrance';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type MotionState = Record<string, number | string | undefined>;

type Props = {
  children: ReactNode;
  variant?: MotionVariantName;
  from?: MotionState;
  animate?: MotionState;
  exit?: MotionState;
  delay?: number;
  index?: number;
  transition?: unknown;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

function readNumber(state: Record<string, unknown>, key: string, fallback: number): number {
  const value = state[key];
  return typeof value === 'number' ? value : fallback;
}

function resolveEntrance(
  variant: MotionVariantName,
  from?: MotionState,
): { offsetY: number; scaleFrom: number; spring: typeof SPRING_PRIMARY } {
  const base = motionVariants[variant].from as Record<string, unknown>;
  const fromState = { ...base, ...from };
  const translateY = readNumber(fromState, 'translateY', 0);
  const scale = readNumber(fromState, 'scale', 0.94);

  if (variant === 'fadeInDown' || translateY < 0) {
    return { offsetY: translateY || -10, scaleFrom: scale, spring: SPRING_SUBTLE };
  }
  if (variant === 'scaleIn') {
    return { offsetY: 0, scaleFrom: scale, spring: SPRING_SUBTLE };
  }
  if (variant === 'slideInRight') {
    return { offsetY: 12, scaleFrom: 0.96, spring: SPRING_CARD };
  }
  return {
    offsetY: translateY || 20,
    scaleFrom: scale,
    spring: variant === 'fadeInUp' ? SPRING_PRIMARY : SPRING_SUBTLE,
  };
}

export function MotionView({
  children,
  variant = 'fadeIn',
  from,
  delay = 0,
  index,
  style,
}: Props) {
  const reducedMotion = useReducedMotion();
  const totalDelay = delay + (index != null ? staggerDelay(index) : 0);
  const entrance = resolveEntrance(variant, from);

  if (reducedMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <SpringEntrance
      delay={totalDelay}
      offsetY={entrance.offsetY}
      scaleFrom={entrance.scaleFrom}
      spring={entrance.spring}
      style={style}
    >
      {children}
    </SpringEntrance>
  );
}

export function MotionStagger({
  children,
  style,
}: {
  children: ReactNode;
  baseDelay?: number;
  variant?: MotionVariantName;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={style}>{children}</View>;
}
