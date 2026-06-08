import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parsePowerShieldDashboard, parsePowerShieldMeter, parsePowerShieldFeedbackResponse } from '@/esopay/api/schemas';
import { esoPayKeys } from '@/esopay/api/queryKeys';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import type { PowerShieldDashboard } from '@/esopay/api/types';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';

export function usePowerShield() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled();

  return useQuery({
    queryKey: esoPayKeys.powerShield(host.companyId),
    queryFn: async () => parsePowerShieldDashboard(await api.powerShield.getDashboard()),
    enabled,
    staleTime: CacheTier.dashboard.staleTime,
    refetchOnWindowFocus: true,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useSyncPowerShield() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => parsePowerShieldDashboard(await api.powerShield.sync()),
    onSuccess: (data) => {
      queryClient.setQueryData(esoPayKeys.powerShield(host.companyId), data);
    },
  });
}

export function useUpdatePowerShieldMeter() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      meterId,
      patch,
    }: {
      meterId: string;
      patch: {
        label?: string;
        daily_spend_kobo?: number | null;
        auto_top_up_enabled?: boolean;
        notify_warn_10?: boolean;
        notify_critical_5?: boolean;
      };
    }) => parsePowerShieldMeter(await api.powerShield.updateMeter(meterId, patch)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: esoPayKeys.powerShield(host.companyId) });
    },
  });
}

export function useRegisterPowerShieldPush() {
  const api = useEsoPayApiClient();
  return useMutation({
    mutationFn: api.powerShield.registerPushToken,
  });
}

export function useSubmitPowerShieldFeedback() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: import('@/esopay/api/types').PowerShieldFeedbackRequest) =>
      parsePowerShieldFeedbackResponse(await api.powerShield.submitFeedback(body)),
    onSuccess: (data) => {
      queryClient.setQueryData<PowerShieldDashboard>(esoPayKeys.powerShield(host.companyId), (current) => {
        if (!current) return current;
        return {
          ...current,
          summary: {
            ...current.summary,
            accuracy_sample_size: data.accuracy.sample_size,
            accuracy_rate: data.accuracy.accuracy_rate,
          },
        };
      });
      void queryClient.invalidateQueries({ queryKey: esoPayKeys.powerShield(host.companyId) });
    },
  });
}
