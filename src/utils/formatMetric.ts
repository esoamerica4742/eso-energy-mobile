export function formatMetric(
  value: number,
  unit: string,
  abbreviate: boolean,
): string {
  if (!abbreviate) {
    if (unit === '%') return `${value}%`;
    if (unit === '₦') return `₦${value.toLocaleString('en-NG')}`;
    return `${value.toLocaleString('en-NG')} ${unit}`.trim();
  }
  if (unit === '₦') {
    if (value >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₦${(value / 1_000).toFixed(1)}K`;
    return `₦${value.toLocaleString('en-NG')}`;
  }
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B${unit}`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M${unit}`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K${unit}`;
  return `${value}${unit}`;
}

export function formatKPI(value: number): string {
  return value.toLocaleString('en-NG');
}

export function formatInverterNumber(value: number, decimals = 0): string {
  if (decimals <= 0) return String(Math.round(value));
  return value.toFixed(decimals);
}

export function formatLegendValue(value: number, unit: string): string {
  if (unit === '%') return `${Math.round(value)}%`;
  if (unit === 'kW') return `${value.toFixed(2)} kW`;
  return `${value}${unit}`;
}
