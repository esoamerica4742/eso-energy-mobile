import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { MotiView, type MotiTransition } from 'moti';
import {
  motionSpring,
  motionVariants,
  type MotionVariantName,
  staggerDelay,
} from '@/lib/motion/presets';
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
  transition?: MotiTransition;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function MotionView({
  children,
  variant = 'fadeInUp',
  from,
  animate,
  exit,
  delay = 0,
  index,
  transition,
  style,
}: Props) {
  const reduced = useReducedMotion();
  const preset = motionVariants[variant];
  const resolvedDelay = delay + (index != null ? staggerDelay(index) : 0);
  const exitState = 'exit' in preset ? preset.exit : { opacity: 0 };

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <MotiView
      from={from ?? preset.from}
      animate={animate ?? preset.animate}
      exit={exit ?? exitState}
      transition={transition ?? motionSpring.gentle}
      delay={resolvedDelay}
      style={style}
    >
      {children}
    </MotiView>
  );
}

export function MotionStagger({
  children,
  baseDelay = 0,
  variant = 'fadeInUp',
}: {
  children: ReactNode;
  baseDelay?: number;
  variant?: MotionVariantName;
}) {
  return (
    <MotionView variant={variant} delay={baseDelay}>
      {children}
    </MotionView>
  );
}
