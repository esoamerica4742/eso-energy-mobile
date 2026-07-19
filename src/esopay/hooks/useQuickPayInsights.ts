import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UtilityProvider } from '@/esopay/api/types';
import { useUtilityProviders } from '@/esopay/api/hooks/useBilling';
import type { QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';
import {
  loadQuickPayHistory,
  pickMostUsedCategory,
  type QuickPayHistoryEntry,
} from '@/esopay/storage/quickPayHistory';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { formatCurrency } from '@/esopay/utils/currency';

type HistoryMap = Partial<Record<QuickPayCategoryKey, QuickPayHistoryEntry>>;

export type PredictivePayAction = {
  label: string;
  provider: UtilityProvider;
  accountNumber?: string;
  amountKobo?: number;
};

function buildPredictiveNudge(
  history: HistoryMap,
  hour: number,
): string | null {
  const air = history.air;
  if (air?.brandId === 'mtn' && air.amountKobo) {
    const amount = formatCurrency(air.amountKobo);
    if (hour >= 17 && hour <= 21) {
      return `You usually buy ${amount} MTN around this time`;
    }
    return `Repeat your last MTN top-up (${amount}) in one tap`;
  }

  const data = history.data;
  if (data) {
    return `Ready for another ${data.providerName} bundle?`;
  }

  const elec = history.elec;
  if (elec) {
    return `Keep ${elec.providerName} topped up before the lights go`;
  }

  if (hour >= 6 && hour <= 10) {
    return null;
  }

  return null;
}

function pickActionEntry(history: HistoryMap, hour: number): QuickPayHistoryEntry | null {
  const air = history.air;
  if (air?.providerId && air.amountKobo) {
    if (air.brandId === 'mtn' || (hour >= 17 && hour <= 21)) return air;
    if (air.amountKobo) return air;
  }
  if (history.data?.providerId) return history.data ?? null;
  if (history.elec?.providerId) return history.elec ?? null;
  if (history.tv?.providerId) return history.tv ?? null;
  return air?.providerId ? air : null;
}

export function useQuickPayInsights() {
  const host = useEsoPayHost();
  const companyId = host.companyId;
  const providersQuery = useUtilityProviders();
  const [history, setHistory] = useState<HistoryMap>({});

  const refresh = useCallback(async () => {
    if (!companyId) {
      setHistory({});
      return;
    }
    const loaded = await loadQuickPayHistory(companyId);
    setHistory(loaded);
  }, [companyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mostUsedKey = useMemo(() => pickMostUsedCategory(history), [history]);

  const hasQuickPayHistory = useMemo(
    () => Object.values(history).some(Boolean),
    [history],
  );

  const hour = new Date().getHours();

  const predictiveNudge = useMemo(
    () => buildPredictiveNudge(history, hour),
    [history, hour],
  );

  const predictiveAction = useMemo((): PredictivePayAction | null => {
    const entry = pickActionEntry(history, hour);
    if (!entry?.providerId || !providersQuery.data?.length) return null;
    const provider = providersQuery.data.find((p) => p.id === entry.providerId);
    if (!provider) return null;
    const label = predictiveNudge ?? `Pay ${entry.providerName} again`;
    return {
      label,
      provider,
      accountNumber: entry.accountNumber,
      amountKobo: entry.amountKobo,
    };
  }, [history, hour, predictiveNudge, providersQuery.data]);

  return {
    refresh,
    predictiveNudge,
    predictiveAction,
    mostUsedKey,
    hasQuickPayHistory,
  };
}
