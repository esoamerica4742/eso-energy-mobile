/** Framer Motion–style spring & timing presets for Moti / Reanimated */

export const motionSpring = {
  snappy: { type: 'spring' as const, damping: 22, stiffness: 320, mass: 1 },
  gentle: { type: 'spring' as const, damping: 26, stiffness: 190, mass: 1 },
  bouncy: { type: 'spring' as const, damping: 14, stiffness: 210, mass: 0.9 },
  dock: { type: 'spring' as const, damping: 24, stiffness: 280, mass: 1 },
  luxury: { type: 'spring' as const, damping: 28, stiffness: 240, mass: 1.05 },
};

export const motionTiming = {
  fast: { type: 'timing' as const, duration: 180 },
  normal: { type: 'timing' as const, duration: 280 },
  slow: { type: 'timing' as const, duration: 420 },
};

export const motionVariants = {
  fadeIn: {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    from: { opacity: 0, translateY: 16 },
    animate: { opacity: 1, translateY: 0 },
    exit: { opacity: 0, translateY: 8 },
  },
  fadeInDown: {
    from: { opacity: 0, translateY: -12 },
    animate: { opacity: 1, translateY: 0 },
    exit: { opacity: 0, translateY: -6 },
  },
  scaleIn: {
    from: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
  slideInRight: {
    from: { opacity: 0, translateX: 24 },
    animate: { opacity: 1, translateX: 0 },
    exit: { opacity: 0, translateX: 12 },
  },
  press: {
    from: { scale: 1 },
    animate: { scale: 1 },
    pressed: { scale: 0.975 },
  },
} as const;

export type MotionVariantName = keyof typeof motionVariants;

export function staggerDelay(index: number, base = 60, cap = 480) {
  return Math.min(index * base, cap);
}
