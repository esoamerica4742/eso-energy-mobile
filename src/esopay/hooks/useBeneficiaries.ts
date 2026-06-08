import { useCallback, useEffect, useState } from 'react';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import {
  loadBeneficiaries,
  removeBeneficiary,
  upsertBeneficiary,
  type EsoPayBeneficiary,
} from '@/esopay/storage/beneficiaries';

export function useBeneficiaries(providerId?: string) {
  const host = useEsoPayHost();
  const [beneficiaries, setBeneficiaries] = useState<EsoPayBeneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!host.companyId) {
      setBeneficiaries([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const list = await loadBeneficiaries(host.companyId);
    setBeneficiaries(list);
    setIsLoading(false);
  }, [host.companyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (input: Omit<EsoPayBeneficiary, 'id' | 'savedAt'>) => {
      if (!host.companyId) return beneficiaries;
      const next = await upsertBeneficiary(host.companyId, input);
      setBeneficiaries(next);
      return next;
    },
    [beneficiaries, host.companyId],
  );

  const remove = useCallback(
    async (beneficiaryId: string) => {
      if (!host.companyId) return beneficiaries;
      const next = await removeBeneficiary(host.companyId, beneficiaryId);
      setBeneficiaries(next);
      return next;
    },
    [beneficiaries, host.companyId],
  );

  const forProvider = providerId
    ? beneficiaries.filter((item) => item.providerId === providerId)
    : beneficiaries;

  return {
    beneficiaries: forProvider,
    allBeneficiaries: beneficiaries,
    isLoading,
    refresh,
    save,
    remove,
  };
}
