import type { QueryClient } from '@tanstack/react-query';
import type { EnodeDevice } from '@/services/enode.types';
import { ENODE_DEVICES_KEY } from '@/hooks/useEnodeDevices';

/** Surgical device-list patch — avoids full ENODE_DEVICES refetch on realtime events. */
export function patchEnodeDeviceInCache(
  queryClient: QueryClient,
  deviceId: string,
  patch: Partial<EnodeDevice> | ((device: EnodeDevice) => EnodeDevice),
): void {
  queryClient.setQueryData<EnodeDevice[]>(ENODE_DEVICES_KEY, (prev) => {
    if (!prev) return prev;
    let changed = false;
    const next = prev.map((device) => {
      if (device.id !== deviceId) return device;
      changed = true;
      return typeof patch === 'function' ? patch(device) : { ...device, ...patch };
    });
    return changed ? next : prev;
  });
}

export function upsertEnodeDeviceInCache(queryClient: QueryClient, row: EnodeDevice): void {
  queryClient.setQueryData<EnodeDevice[]>(ENODE_DEVICES_KEY, (prev) => {
    if (!prev) return [row];
    const index = prev.findIndex((d) => d.id === row.id);
    if (index === -1) return [row, ...prev];
    const next = [...prev];
    next[index] = { ...next[index], ...row };
    return next;
  });
}

export function removeEnodeDeviceFromCache(queryClient: QueryClient, deviceId: string): void {
  queryClient.setQueryData<EnodeDevice[]>(ENODE_DEVICES_KEY, (prev) => {
    if (!prev) return prev;
    const next = prev.filter((d) => d.id !== deviceId);
    return next.length === prev.length ? prev : next;
  });
}
