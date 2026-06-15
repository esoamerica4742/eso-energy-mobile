import { useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useEnodeDashboardTelemetry } from '@/hooks/useEnodeDashboardTelemetry';
import { useRealtimeTelemetry } from '@/hooks/useRealtimeTelemetry';
import { useDemoTelemetryEngine } from '@/hooks/useDemoTelemetryEngine';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import {
  TELEMETRY_OFFLINE_MS,
  TELEMETRY_STALE_MS,
  TELEMETRY_WINDOW_SIZE,
} from '@/lib/monitor/telemetryConfig';
import type { EnodeDevice } from '@/services/enode.types';
import { useRealtimeTelemetryStore } from '@/stores/realtimeTelemetryStore';
import {
  selectHistory,
  selectLatest,
  useTelemetryStore,
  type TelemetryPoint,
} from '@/stores/telemetryStore';

export type SiteTelemetryStreamResult = {
  readings: TelemetryPoint[];
  latestReading: TelemetryPoint | null;
  isLive: boolean;
  isStale: boolean;
  isReconnecting: boolean;
  isReady: boolean;
  error: Error | null;
};

type Options = {
  siteId: string | null | undefined;
  companyId: string | null | undefined;
  deviceIds: string[];
  enodeDevices: EnodeDevice[];
  primaryDeviceId?: string | null;
  enabled?: boolean;
};

/**
 * Site-scoped telemetry stream (Option B — Enode + telemetry_latest_state).
 * Fetches/seeds history, subscribes on focus, trims to 120 points.
 */
export function useSiteTelemetryStream({
  siteId,
  companyId,
  deviceIds,
  enodeDevices,
  primaryDeviceId,
  enabled = true,
}: Options): SiteTelemetryStreamResult {
  const isDemoMode = useDemoModeActive();
  const deviceId = primaryDeviceId ?? deviceIds[0] ?? null;
  const active = enabled && Boolean(siteId) && deviceIds.length > 0 && Boolean(deviceId);

  const readings = useTelemetryStore(selectHistory(deviceId ?? '__none'));
  const latestReading = useTelemetryStore(selectLatest(deviceId ?? '__none'));
  const isConnected = useRealtimeTelemetryStore((s) => s.wsConnected);
  const lastMessageAt = useRealtimeTelemetryStore((s) => s.lastSyncAt);

  const markedSubscribed = useRef(false);

  useDemoTelemetryEngine({
    siteId: siteId ?? null,
    primaryDeviceId: deviceId,
    enabled: active && isDemoMode,
  });

  useRealtimeTelemetry({
    tenantId: companyId ?? undefined,
    enabled: active && !isDemoMode,
  });

  useEnodeDashboardTelemetry({
    siteId,
    companyId,
    deviceIds,
    enodeDevices,
    enabled: active && !isDemoMode,
  });

  const markSubscribed = useTelemetryStore((s) => s.markSubscribed);
  const clearSite = useTelemetryStore((s) => s.clearSite);

  useFocusEffect(
    useCallback(() => {
      if (!siteId || !active) return undefined;
      markSubscribed(siteId, true);
      markedSubscribed.current = true;
      return () => {
        markSubscribed(siteId, false);
        clearSite(siteId);
        markedSubscribed.current = false;
      };
    }, [active, clearSite, markSubscribed, siteId]),
  );

  const lastAt = latestReading?.timestamp ?? null;
  const ageMs = useMemo(() => {
    if (!lastAt) return null;
    const t = new Date(lastAt).getTime();
    return Number.isNaN(t) ? null : Math.max(0, Date.now() - t);
  }, [lastAt]);

  const isStale = ageMs != null && ageMs > TELEMETRY_STALE_MS;
  const isOffline = ageMs == null || ageMs > TELEMETRY_OFFLINE_MS;
  const isLive = active && !isOffline && !isStale && (isDemoMode || isConnected);
  const isReady = readings.length >= 10 || !active;
  const isReconnecting = active && !isDemoMode && !isConnected && readings.length > 0;

  return {
    readings: readings.slice(-TELEMETRY_WINDOW_SIZE),
    latestReading,
    isLive,
    isStale,
    isReconnecting,
    isReady,
    error: null,
  };
}
