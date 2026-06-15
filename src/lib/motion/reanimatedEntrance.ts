/**
 * @deprecated Use `useSpringEntrance` / `SpringEntrance` from `@/lib/motion/springMotion`.
 * Kept for legacy `entering` prop callers during migration.
 */
import { Easing, FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { motionVariants, type MotionVariantName } from '@/lib/motion/presets';

const LUXURY_EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const ENTRANCE_DURATION_MS = 520;

function readNumber(
  state: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const value = state[key];
  return typeof value === 'number' ? value : fallback;
}

/** @deprecated Prefer SpringEntrance + withSpring entrance pattern. */
export function buildReanimatedEntering(
  variant: MotionVariantName = 'fadeIn',
  delay = 0,
  from?: Record<string, unknown>,
) {
  const base = motionVariants[variant].from as Record<string, unknown>;
  const fromState = { ...base, ...from };
  const translateY = readNumber(fromState, 'translateY', 0);
  const opacityStart = readNumber(fromState, 'opacity', 0);
  const scale = readNumber(fromState, 'scale', 0.94);

  if (variant === 'fadeInDown' || translateY < 0) {
    return FadeInDown.delay(delay)
      .duration(ENTRANCE_DURATION_MS)
      .easing(LUXURY_EASE)
      .withInitialValues({
        opacity: opacityStart,
        transform: [{ translateY: translateY || -12 }],
      });
  }

  if (variant === 'fadeInUp' || translateY > 0) {
    return FadeInUp.delay(delay)
      .duration(ENTRANCE_DURATION_MS)
      .easing(LUXURY_EASE)
      .withInitialValues({
        opacity: opacityStart,
        transform: [{ translateY }],
      });
  }

  if (variant === 'scaleIn') {
    return FadeIn.delay(delay)
      .duration(ENTRANCE_DURATION_MS)
      .easing(LUXURY_EASE)
      .withInitialValues({
        opacity: opacityStart,
        transform: [{ scale }],
      });
  }

  return FadeIn.delay(delay).duration(ENTRANCE_DURATION_MS).easing(LUXURY_EASE);
}
