import { useQuery } from '@tanstack/react-query';
import { enodeClient } from '@/services/enode';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { getDemoDevices } from '@/lib/demoFleet';

export function enodeDeviceKey(deviceId: string) {
  return ['enode', 'device', deviceId] as const;
}

/**
 * Single device: 30s polling + Supabase Realtime overlay (WebSocket layer).
 */
export function useEnodeDevice(deviceId: string | null | undefined) {
  const isDemoMode = useDemoModeActive();

  return useQuery({
    queryKey: enodeDeviceKey(deviceId ?? ''),
    queryFn: async () => {
      if (!deviceId) return null;
      if (isDemoMode) {
        return getDemoDevices().find((device) => device.id === deviceId) ?? null;
      }
      const res = await enodeClient.getDevice(deviceId, false);
      return res.device;
    },
    enabled: Boolean(deviceId),
    staleTime: 30_000,
    refetchInterval: isDemoMode ? false : 30_000,
    retry: isDemoMode ? 0 : 2,
  });
}
