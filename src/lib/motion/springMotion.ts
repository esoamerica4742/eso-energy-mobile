import { useCallback, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
  type WithSpringConfig,
} from 'react-native-reanimated';

export const SPRING_PRIMARY: WithSpringConfig = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
  overshootClamping: false,
};

export const SPRING_CARD: WithSpringConfig = {
  damping: 22,
  stiffness: 140,
  mass: 0.9,
  overshootClamping: false,
};

export const SPRING_SUBTLE: WithSpringConfig = {
  damping: 24,
  stiffness: 160,
  mass: 1.0,
  overshootClamping: true,
};

export const SPRING_CARD_PRESS_IN: WithSpringConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.6,
};

export const SPRING_CARD_PRESS_OUT: WithSpringConfig = {
  damping: 16,
  stiffness: 200,
  mass: 0.6,
};

export const SPRING_BTN_PRESS_IN: WithSpringConfig = {
  damping: 20,
  stiffness: 400,
  mass: 0.5,
};

export const SPRING_BTN_PRESS_OUT: WithSpringConfig = {
  damping: 14,
  stiffness: 180,
  mass: 0.6,
};

export const SPRING_TAB_POP: WithSpringConfig = {
  damping: 12,
  stiffness: 500,
  mass: 0.4,
};

export const SPRING_TAB_SETTLE: WithSpringConfig = {
  damping: 14,
  stiffness: 200,
  mass: 0.5,
};

export const SPRING_DOT_POP: WithSpringConfig = {
  damping: 10,
  stiffness: 400,
  mass: 0.5,
};

export const SPRING_DOT_SETTLE: WithSpringConfig = {
  damping: 14,
  stiffness: 200,
  mass: 0.6,
};

export const SPRING_DOT_CLEAR: WithSpringConfig = {
  damping: 20,
  stiffness: 300,
};

export type SpringEntranceOptions = {
  delay?: number;
  offsetY?: number;
  scaleFrom?: number;
  spring?: WithSpringConfig;
  enabled?: boolean;
};

export function useSpringEntrance({
  delay = 0,
  offsetY = 20,
  scaleFrom = 0.94,
  spring = SPRING_PRIMARY,
  enabled = true,
}: SpringEntranceOptions = {}) {
  const anim = useSharedValue(enabled ? 0 : 1);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!mounted) return;
      if (!enabled || reduced) {
        anim.value = 1;
        return;
      }
      anim.value = withDelay(delay, withSpring(1, spring));
    });
    return () => {
      mounted = false;
    };
  }, [anim, delay, enabled, spring]);

  return useAnimatedStyle(() => ({
    opacity: interpolate(anim.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(anim.value, [0, 1], [offsetY, 0]) },
      { scale: interpolate(anim.value, [0, 1], [scaleFrom, 1]) },
    ],
  }));
}

export function useCardPressAnimation() {
  const pressAnim = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pressAnim.value }],
  }));

  const onPressIn = useCallback(() => {
    pressAnim.value = withSpring(0.96, SPRING_CARD_PRESS_IN);
  }, [pressAnim]);

  const onPressOut = useCallback(() => {
    pressAnim.value = withSpring(1, SPRING_CARD_PRESS_OUT);
  }, [pressAnim]);

  return { style, onPressIn, onPressOut, pressAnim };
}

export function useButtonPressAnimation() {
  const btnAnim = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: btnAnim.value }],
    opacity: interpolate(btnAnim.value, [0.95, 1], [0.85, 1]),
  }));

  const onPressIn = useCallback(() => {
    btnAnim.value = withSpring(0.97, SPRING_BTN_PRESS_IN);
  }, [btnAnim]);

  const onPressOut = useCallback(() => {
    btnAnim.value = withSpring(1, SPRING_BTN_PRESS_OUT);
  }, [btnAnim]);

  return { style, onPressIn, onPressOut, btnAnim };
}

export function runPinDotPop(scale: SharedValue<number>, opacity?: SharedValue<number>) {
  scale.value = withSequence(withSpring(1.3, SPRING_DOT_POP), withSpring(1, SPRING_DOT_SETTLE));
  if (opacity) {
    opacity.value = withSequence(withSpring(1, SPRING_DOT_POP), withSpring(1, SPRING_DOT_SETTLE));
  }
}

export function runPinDotClear(scale: SharedValue<number>) {
  scale.value = withSpring(0, SPRING_DOT_CLEAR);
}

export function runWrongPinShake(shakeAnim: SharedValue<number>) {
  shakeAnim.value = withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-8, { duration: 50 }),
    withTiming(8, { duration: 50 }),
    withTiming(-5, { duration: 50 }),
    withTiming(5, { duration: 50 }),
    withTiming(0, { duration: 50 }),
  );
}

export function useShakeAnimation() {
  const shakeAnim = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const shake = useCallback(() => {
    runWrongPinShake(shakeAnim);
  }, [shakeAnim]);

  return { style, shake, shakeAnim };
}

export function useTabPressBounce() {
  const tabAnim = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: tabAnim.value }],
  }));

  const bounce = useCallback(() => {
    tabAnim.value = withSequence(withSpring(0.85, SPRING_TAB_POP), withSpring(1, SPRING_TAB_SETTLE));
  }, [tabAnim]);

  return { style, bounce, tabAnim };
}
