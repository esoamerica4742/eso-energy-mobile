import { useEffect, useState } from 'react';
import { Text, type TextStyle } from 'react-native';

type Props = {
  value: number;
  format?: (n: number) => string;
  style?: TextStyle;
  duration?: number;
};

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toString(),
  style,
  duration = 800,
}: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <Text style={style}>{format(display)}</Text>;
}
