/** easeOutExpo — t => 1 - 2^(-10t) */
export function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function formatCount(value: number, decimals: number) {
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec != null ? `${withCommas}.${dec}` : withCommas;
}

export function runCountUp(
  target: number,
  duration: number,
  decimals: number,
  onUpdate: (v: number) => void,
  onDone?: () => void,
) {
  const start = performance.now();
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    onUpdate(target * easeOutExpo(progress));
    if (progress < 1) requestAnimationFrame(tick);
    else onDone?.();
  };
  requestAnimationFrame(tick);
}
