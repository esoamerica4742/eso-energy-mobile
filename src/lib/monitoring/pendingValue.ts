import { Colors } from '@/tokens/design';

export const PENDING_PLACEHOLDER = '—';

export function isPendingPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === PENDING_PLACEHOLDER || trimmed === '-' || trimmed === '—';
}

export function pendingMetricColor(value: string, fallback?: string): string | undefined {
  if (isPendingPlaceholder(value)) return Colors.pendingValue;
  return fallback;
}
