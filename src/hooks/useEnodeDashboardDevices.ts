import { useMemo } from 'react';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import {
  filterEnodeDevicesForSite,
  mapEnodeDeviceToDb,
} from '@/lib/enodeTelemetryAdapter';
import type { DbDevice } from '@/services/supabase/types';
import type { EnodeDevice } from '@/services/enode.types';

const EMPTY_DEVICES: DbDevice[] = [];
const EMPTY_ENODE_DEVICES: EnodeDevice[] = [];

export function useEnodeDashboardDevices(siteId: string | null | undefined) {
  const devicesQuery = useEnodeDevices();
  const latestQuery = useEnodeTelemetryLatest(siteId ?? undefined);

  const telemetrySiteByDevice = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const point of latestQuery.data ?? []) {
      map.set(point.device_id, point.site_id);
    }
    return map;
  }, [latestQuery.data]);

  const enodeDevices = useMemo(() => {
    if (!siteId) return EMPTY_ENODE_DEVICES;
    return filterEnodeDevicesForSite(
      devicesQuery.data ?? [],
      siteId,
      telemetrySiteByDevice,
    );
  }, [devicesQuery.data, siteId, telemetrySiteByDevice]);

  const devices = useMemo((): DbDevice[] => {
    if (!siteId) return EMPTY_DEVICES;
    return enodeDevices.map((device) => mapEnodeDeviceToDb(device, siteId));
  }, [enodeDevices, siteId]);

  const isPending = devicesQuery.isPending;
  const isFetching = devicesQuery.isFetching || latestQuery.isFetching;
  const refetch = devicesQuery.refetch;

  return useMemo(
    () => ({
      data: devices,
      enodeDevices,
      isPending,
      isFetching,
      refetch,
    }),
    [devices, enodeDevices, isPending, isFetching, refetch],
  );
}

export type EnodeDashboardDevicesResult = {
  data: DbDevice[];
  enodeDevices: EnodeDevice[];
  isPending: boolean;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
};
