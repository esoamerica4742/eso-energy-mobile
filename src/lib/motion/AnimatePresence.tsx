import { type ReactNode } from 'react';
import { AnimatePresence as MotiAnimatePresence } from 'moti';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type Props = {
  children: ReactNode;
  visible?: boolean;
};

/** Framer Motion AnimatePresence — mount/unmount with exit animations */
export function AnimatePresence({ children, visible = true }: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return visible ? <>{children}</> : null;
  }

  return <MotiAnimatePresence exitBeforeEnter>{visible ? children : null}</MotiAnimatePresence>;
}
