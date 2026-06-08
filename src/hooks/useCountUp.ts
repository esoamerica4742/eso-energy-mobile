import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { formatInverterNumber, formatKPI } from '@/utils/formatMetric';

export function useCountUp(target: number, duration = 1400, delay = 0): string {
  const animated = useRef(new Animated.Value(
    target > 1_000_000 ? target * 0.7 : 0,
  )).current;
  const [display, setDisplay] = useState(
    formatKPI(target > 1_000_000 ? Math.round(target * 0.7) : 0),
  );

  useEffect(() => {
    const startValue = target > 1_000_000 ? target * 0.7 : 0;
    animated.setValue(startValue);
    setDisplay(formatKPI(Math.round(startValue)));

    let listenerId: string | undefined;
    const timeout = setTimeout(() => {
      listenerId = animated.addListener(({ value }) => {
        setDisplay(formatKPI(Math.round(value)));
      });

      Animated.timing(animated, {
        toValue: target,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (listenerId != null) animated.removeListener(listenerId);
    };
  }, [animated, delay, duration, target]);

  return display;
}

type DecimalCountUpOptions = {
  start?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  animate?: boolean;
};

export function useDecimalCountUp(
  target: number,
  {
    start = 0,
    duration = 1200,
    delay = 0,
    decimals = 1,
    animate = true,
  }: DecimalCountUpOptions = {},
): string {
  const animated = useRef(new Animated.Value(start)).current;
  const [display, setDisplay] = useState(formatInverterNumber(start, decimals));

  useEffect(() => {
    if (!animate || start === target) {
      animated.setValue(target);
      setDisplay(formatInverterNumber(target, decimals));
      return;
    }

    animated.setValue(start);
    setDisplay(formatInverterNumber(start, decimals));

    let listenerId: string | undefined;
    const timeout = setTimeout(() => {
      listenerId = animated.addListener(({ value }) => {
        setDisplay(formatInverterNumber(value, decimals));
      });

      Animated.timing(animated, {
        toValue: target,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (listenerId != null) animated.removeListener(listenerId);
    };
  }, [animate, animated, decimals, delay, duration, start, target]);

  return display;
}

export function useLiveDotPulse(enabled = true) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!enabled) {
      pulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
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
