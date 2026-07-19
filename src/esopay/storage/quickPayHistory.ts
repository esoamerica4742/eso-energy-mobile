import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuickPayBrandId, QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';

const STORAGE_PREFIX = 'esopay:quick-pay:';

export type QuickPayHistoryEntry = {
  categoryKey: QuickPayCategoryKey;
  brandId: QuickPayBrandId;
  providerName: string;
  /** Live utility_providers.id when known — enables one-tap pay. */
  providerId?: string;
  accountNumber?: string;
  amountKobo?: number;
  paidAt: string;
  useCount: number;
};

type HistoryMap = Partial<Record<QuickPayCategoryKey, QuickPayHistoryEntry>>;

function storageKey(companyId: string): string {
  return `${STORAGE_PREFIX}${companyId}`;
}

export async function loadQuickPayHistory(companyId: string): Promise<HistoryMap> {
  if (!companyId) return {};
  try {
    const raw = await AsyncStorage.getItem(storageKey(companyId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HistoryMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function recordQuickPayTransaction(
  companyId: string,
  entry: Omit<QuickPayHistoryEntry, 'useCount' | 'paidAt'> & { paidAt?: string },
): Promise<HistoryMap> {
  if (!companyId) return {};
  const current = await loadQuickPayHistory(companyId);
  const prev = current[entry.categoryKey];
  const nextEntry: QuickPayHistoryEntry = {
    ...entry,
    paidAt: entry.paidAt ?? new Date().toISOString(),
    useCount: (prev?.useCount ?? 0) + 1,
  };
  const next: HistoryMap = { ...current, [entry.categoryKey]: nextEntry };
  await AsyncStorage.setItem(storageKey(companyId), JSON.stringify(next));
  return next;
}

export function pickMostUsedCategory(history: HistoryMap): QuickPayCategoryKey | null {
  let best: QuickPayHistoryEntry | null = null;
  for (const entry of Object.values(history)) {
    if (!entry) continue;
    if (!best || entry.useCount > best.useCount) best = entry;
  }
  return best?.categoryKey ?? null;
}

export function formatLastPaidLabel(paidAt: string): string {
  const then = new Date(paidAt).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60_000);
  if (diffMin < 1) return 'Last paid just now';
  if (diffMin < 60) return `Last paid ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Last paid ${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Last paid yesterday';
  if (diffDay < 7) return `Last paid ${diffDay}d ago`;
  return `Last paid ${new Date(paidAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`;
}
