import { useEffect, useState } from 'react';

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, duration = 1400, enabled = true) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }

    let frame = 0;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      setDisplay(target * easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    setDisplay(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, enabled]);

  return display;
}
