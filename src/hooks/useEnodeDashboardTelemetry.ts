import { useEffect, useMemo } from 'react';
import { useEnodeTelemetry } from '@/hooks/useEnodeTelemetry';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import { useRealtimeTelemetry } from '@/hooks/useRealtimeTelemetry';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import {
  enodeDeviceToTelemetryPoint,
  enodeHistoryToTelemetryPoint,
  enodeLatestToTelemetryPoint,
  enodeRealtimeToTelemetryPoint,
} from '@/lib/enodeTelemetryAdapter';
import type { EnodeDevice } from '@/services/enode.types';
import { useRealtimeTelemetryStore } from '@/stores/realtimeTelemetryStore';
import { useTelemetryStore } from '@/stores/telemetryStore';

type Options = {
  siteId: string | null | undefined;
  companyId: string | null | undefined;
  deviceIds: string[];
  enodeDevices: EnodeDevice[];
  enabled?: boolean;
};

export function useEnodeDashboardTelemetry({
  siteId,
  companyId,
  deviceIds,
  enodeDevices,
  enabled = true,
}: Options) {
  const isDemoMode = useDemoModeActive();
  const seed = useTelemetryStore((s) => s.seed);
  const push = useTelemetryStore((s) => s.push);
  const realtimeByDevice = useRealtimeTelemetryStore((s) => s.byDevice);

  const active = enabled && Boolean(companyId) && deviceIds.length > 0;
  const primaryDeviceId = deviceIds[0] ?? null;
  const deviceIdsKey = useMemo(() => deviceIds.join('|'), [deviceIds]);
  const enodeDeviceKey = useMemo(
    () => enodeDevices.map((device) => device.id).join('|'),
    [enodeDevices],
  );
  const realtimeKey = useMemo(
    () =>
      deviceIds
        .map((deviceId) => {
          const realtime = realtimeByDevice[deviceId];
          if (!realtime) return `${deviceId}:none`;
          return `${deviceId}:${realtime.updatedAt ?? ''}`;
        })
        .join('|'),
    [deviceIdsKey, realtimeByDevice],
  );

  useRealtimeTelemetry({
    tenantId: companyId ?? undefined,
    enabled: active && !isDemoMode,
  });

  const latestQuery = useEnodeTelemetryLatest(siteId ?? undefined);
  const historyQuery = useEnodeTelemetry(primaryDeviceId, 2);

  const latestSeedKey = useMemo(
    () =>
      (latestQuery.data ?? [])
        .map((row) => `${row.device_id}:${row.updated_at}`)
        .join('|'),
    [latestQuery.data],
  );

  const historySeedKey = useMemo(
    () =>
      (historyQuery.data ?? [])
        .map((row) => row.recorded_at)
        .join('|'),
    [historyQuery.data],
  );

  useEffect(() => {
    if (!active) return;

    const points = [];

    for (const row of latestQuery.data ?? []) {
      if (!deviceIds.includes(row.device_id)) continue;
      points.push(enodeLatestToTelemetryPoint(row));
    }

    for (const device of enodeDevices) {
      if (!deviceIds.includes(device.id)) continue;
      const snapshot = enodeDeviceToTelemetryPoint(device);
      if (snapshot) points.push(snapshot);
    }

    for (const row of historyQuery.data ?? []) {
      if (!primaryDeviceId) continue;
      points.push(enodeHistoryToTelemetryPoint(primaryDeviceId, row));
    }

    if (points.length > 0) {
      seed(points);
    }
  }, [
    active,
    deviceIds,
    deviceIdsKey,
    enodeDeviceKey,
    historySeedKey,
    latestSeedKey,
    primaryDeviceId,
    seed,
  ]);

  useEffect(() => {
    if (!active) return;

    for (const deviceId of deviceIds) {
      const realtime = realtimeByDevice[deviceId];
      if (!realtime) continue;
      push(enodeRealtimeToTelemetryPoint(deviceId, realtime));
    }
  }, [active, deviceIds, deviceIdsKey, push, realtimeKey, realtimeByDevice]);
}
