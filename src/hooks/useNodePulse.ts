import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useNodePulse(enabled = true): Animated.Value {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      pulse.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [enabled, pulse]);

  return pulse;
}
