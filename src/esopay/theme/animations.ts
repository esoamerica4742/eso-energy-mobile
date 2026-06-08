import { Easing } from 'react-native-reanimated';

export const easing = {
  luxury: Easing.bezier(0.22, 1, 0.36, 1),
  out: Easing.out(Easing.cubic),
} as const;

export const duration = {
  micro: 200,
  tab: 200,
  page: 350,
  countup: 800,
  shimmer: 1200,
  pulseCritical: 1500,
  pulseWarning: 2000,
} as const;
