import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { esoPayKeys } from '@/esopay/api/queryKeys';
import type { EsoPayKycStatus } from '@/esopay/api/types';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';

export function useEsoPayKyc() {
  const api = useEsoPayApiClient();
  const host = useEsoPayHost();
  const enabled = useEsoPayEnabled();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: esoPayKeys.kyc(host.companyId),
    queryFn: () => api.profile.getKycStatus(),
    enabled,
    staleTime: 60_000,
  });

  const saveKyc = useCallback(
    async (input: { bvn?: string; nin?: string }) => {
      setSaving(true);
      try {
        const result = await api.profile.saveKyc(input);
        queryClient.setQueryData<EsoPayKycStatus>(esoPayKeys.kyc(host.companyId), result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [api, host.companyId, queryClient],
  );

  const needsKyc = Boolean(
    enabled &&
      query.data &&
      !query.data.bvn_configured &&
      !query.data.nin_configured,
  );

  return {
    status: query.data,
    isLoading: query.isLoading,
    needsKyc,
    saving,
    saveKyc,
    refetch: query.refetch,
  };
}
