process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test';

jest.mock('react-native-worklets', () => ({
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  createSerializable: (value) => value,
  isWorkletFunction: () => false,
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');

  const noop = (value) => value;

  return {
    __esModule: true,
    default: {
      View,
      Text: require('react-native').Text,
      createAnimatedComponent: (Component) => Component,
    },
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (updater) => updater(),
    useAnimatedProps: (updater) => updater(),
    useDerivedValue: (updater) => ({ value: updater() }),
    withTiming: noop,
    withRepeat: noop,
    withSequence: (...args) => args[0],
    withDelay: (_, value) => value,
    interpolateColor: () => '#FFFFFF',
    Easing: {
      linear: 'linear',
      cubic: 'cubic',
      out: (easing) => easing,
      in: (easing) => easing,
      inOut: (easing) => easing,
    },
    FadeIn: { duration: () => ({ easing: () => ({}) }) },
    FadeInUp: { duration: () => ({ easing: () => ({}) }) },
  };
});
