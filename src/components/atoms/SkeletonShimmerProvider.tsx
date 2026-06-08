import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { cancelAnimation, Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

const ShimmerContext = createContext<SharedValue<number> | null>(null);

/** One shimmer driver for skeleton trees — replaces N independent Moti loops. */
export function SkeletonShimmerProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const shift = useSharedValue(-1);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(shift);
      shift.value = -1;
      return;
    }
    shift.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(shift);
  }, [reduced, shift]);

  return <ShimmerContext.Provider value={shift}>{children}</ShimmerContext.Provider>;
}

export function useSkeletonShimmer(): SharedValue<number> | null {
  return useContext(ShimmerContext);
}
