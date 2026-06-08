import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';
import {
  loadQuickPayHistory,
  pickMostUsedCategory,
  type QuickPayHistoryEntry,
} from '@/esopay/storage/quickPayHistory';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { formatCurrency } from '@/esopay/utils/currency';

type HistoryMap = Partial<Record<QuickPayCategoryKey, QuickPayHistoryEntry>>;

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

export function useQuickPayInsights() {
  const host = useEsoPayHost();
  const companyId = host.companyId;
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

  const predictiveNudge = useMemo(
    () => buildPredictiveNudge(history, new Date().getHours()),
    [history],
  );

  return {
    refresh,
    predictiveNudge,
    mostUsedKey,
    hasQuickPayHistory,
  };
}
