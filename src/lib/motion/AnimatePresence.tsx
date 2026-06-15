import { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  visible?: boolean;
};

/** Mount/unmount without Moti AnimatePresence (Reanimated 4 worklet crash). */
export function AnimatePresence({ children, visible = true }: Props) {
  return visible ? <>{children}</> : null;
}
