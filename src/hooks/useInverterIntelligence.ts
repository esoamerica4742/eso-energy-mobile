import { useMemo } from 'react';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { useEnodeDevice } from '@/hooks/useEnodeDevice';
import { useEnodeTelemetry } from '@/hooks/useEnodeTelemetry';
import { useFleetPower } from '@/hooks/useFleetPower';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { supabaseConfigured } from '@/lib/supabase';
import { LANDING_INVERTER_BASELINE } from '@/lib/landingDemo';
import {
  computeSystemEfficiency,
  isEnodeLive,
  pickPrimaryInverter,
  resolveArrayLoadKw,
} from '@/lib/inverterMetrics';
import { enodeClient } from '@/services/enode';
import type { EnodeTelemetryPoint } from '@/services/enode.types';

export function useInverterIntelligence(enabled: boolean) {
  const isDemoMode = useDemoModeActive();
  const { isAuthenticated, loading: authLoading } = useSupabaseSession();
  const enodeEnabled = enabled && (isDemoMode || (supabaseConfigured && isAuthenticated));

  const devicesQuery = useEnodeDevices({ syncOnMount: enodeEnabled && !isDemoMode });
  const devices = devicesQuery.data ?? [];
  const primary = useMemo(() => pickPrimaryInverter(devices), [devices]);
  const primaryId = primary?.id;

  const deviceQuery = useEnodeDevice(enodeEnabled ? primaryId : undefined);
  const device = deviceQuery.data ?? primary ?? null;

  const telemetryQuery = useEnodeTelemetry(enodeEnabled ? primaryId : null, 24);
  const fleetQuery = useFleetPower(enabled && !isDemoMode);

  const fleet = useMemo(
    () => fleetQuery.data ?? { solarKw: 0, loadKw: 0 },
    [fleetQuery.data],
  );

  const loadKw = useMemo(() => {
    if (!enabled) return LANDING_INVERTER_BASELINE.loadKw;
    const resolved = resolveArrayLoadKw({ devices, fleet, primary: device });
    if (resolved > 0) return resolved;
    return LANDING_INVERTER_BASELINE.loadKw;
  }, [enabled, devices, fleet, device]);

  const efficiencyPct = useMemo(() => {
    if (!enabled) return LANDING_INVERTER_BASELINE.efficiencyPct;
    const pct = computeSystemEfficiency({
      solarKw: fleet.solarKw,
      loadKw: fleet.loadKw,
      productionKw: device?.production_rate_kw,
      gridPowerKw: device?.grid_power_kw,
    });
    return pct > 0 ? pct : LANDING_INVERTER_BASELINE.efficiencyPct;
  }, [enabled, fleet, device]);

  const isLive = enabled && isEnodeLive(device);

  const points: EnodeTelemetryPoint[] = telemetryQuery.data ?? [];

  const needsSignIn =
    enabled && !isDemoMode && supabaseConfigured && !isAuthenticated && !authLoading;
  const needsLink =
    enabled &&
    enodeEnabled &&
    !isDemoMode &&
    !devicesQuery.isLoading &&
    devices.length === 0;

  const sync = async () => {
    if (!enodeEnabled || isDemoMode) return;
    await enodeClient.syncAll();
    await devicesQuery.refetch();
  };

  const awaitingAuth = enabled && !isDemoMode && supabaseConfigured && authLoading;
  const awaitingEnode =
    enabled &&
    enodeEnabled &&
    !isDemoMode &&
    (devicesQuery.isPending || (primaryId != null && deviceQuery.isPending));

  return {
    loadKw,
    efficiencyPct,
    isLive,
    points,
    device,
    devices,
    isLoading: awaitingAuth || awaitingEnode,
    isError: devicesQuery.isError || telemetryQuery.isError,
    needsSignIn,
    needsLink,
    refetch: async () => {
      await Promise.all([devicesQuery.refetch(), fleetQuery.refetch(), telemetryQuery.refetch()]);
    },
    sync,
  };
}
