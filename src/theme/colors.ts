/** Quiet chrome accent — white (Revolut dialect). Telemetry uses its own semantic colors. */
export const GOLD = '#FFFFFF';

/** RGB components for rgba() — matches {@link GOLD}. */
export const GOLD_RGB = '255, 255, 255';

export const goldRgba = (alpha: number) => `rgba(${GOLD_RGB}, ${alpha})`;
