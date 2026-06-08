import { useCallback, useMemo } from 'react';
import { useEnodeDashboardTelemetry } from '@/hooks/useEnodeDashboardTelemetry';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { useEnodeSiteSummary } from '@/hooks/useEnodeSiteSummary';
import { useEnodeTelemetry } from '@/hooks/useEnodeTelemetry';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import { useOperationalInsights } from '@/hooks/useOperationalInsights';
import { usePerceivedTelemetry } from '@/hooks/usePerceivedTelemetry';
import { useSitesFleet } from '@/hooks/useSitesFleet';
import {
  filterEnodeDevicesForSite,
} from '@/lib/enodeTelemetryAdapter';
import { branchRowsToFleetSites } from '@/lib/fleetSites';
import {
  buildSiteChartData,
  buildSiteInverterRows,
  type SiteChartPoint,
  type SiteInverterRow,
} from '@/lib/siteDetailData';
import { buildInverterData } from '@/lib/mapInverterData';
import { canStreamFrontendLive } from '@/lib/telemetryLivePerception';
import { useAlertStore } from '@/stores/alertStore';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useMotionPrefsStore } from '@/stores/motionPrefsStore';
import { useSiteStore } from '@/stores/siteStore';
import { useTelemetryStore, selectHistory, selectLatest } from '@/stores/telemetryStore';
import type { DashboardData } from '@/types/dashboard';
import type { FleetSite } from '@/types/fleet';

function siteHealthStatus(status: FleetSite['status'] | undefined): DashboardData['health']['status'] {
  if (status === 'live') return 'live';
  if (status === 'degraded') return 'stale';
  return 'offline';
}

export function useSiteDetail(siteId: string | undefined) {
  const companyId = useAuthStore(selectTenantId);
  const reducedMotion = useMotionPrefsStore((s) => s.reducedMotionEnabled);
  const storeSites = useSiteStore((s) => s.sites);
  const { data: branchRows, isPending: fleetPending, isFetching: fleetFetching, refetch: refetchFleet } =
    useSitesFleet();
  const devicesQuery = useEnodeDevices();
  const latestQuery = useEnodeTelemetryLatest();

  const fleetSite = useMemo((): FleetSite | null => {
    const rows = branchRowsToFleetSites(
      branchRows,
      storeSites,
      devicesQuery.data ?? [],
      latestQuery.data ?? [],
    );
    return rows.find((row) => row.id === siteId) ?? null;
  }, [branchRows, devicesQuery.data, latestQuery.data, siteId, storeSites]);

  const siteMeta = useMemo(
    () => storeSites.find((site) => site.id === siteId) ?? null,
    [siteId, storeSites],
  );

  const telemetrySiteByDevice = useMemo(
    () => new Map((latestQuery.data ?? []).map((point) => [point.device_id, point.site_id])),
    [latestQuery.data],
  );

  const siteDevices = useMemo(
    () => filterEnodeDevicesForSite(devicesQuery.data ?? [], siteId, telemetrySiteByDevice),
    [devicesQuery.data, siteId, telemetrySiteByDevice],
  );

  const enodeDevices = useMemo(
    () => siteDevices.map((device) => device),
    [siteDevices],
  );

  const deviceIds = useMemo(() => siteDevices.map((device) => device.id), [siteDevices]);
  const primaryDeviceId = deviceIds[0] ?? null;

  useEnodeDashboardTelemetry({
    siteId,
    companyId,
    deviceIds,
    enodeDevices,
    enabled: Boolean(siteId) && deviceIds.length > 0,
  });

  const primaryTelemetry = useTelemetryStore(selectLatest(primaryDeviceId ?? '__none'));
  const chartHistory = useTelemetryStore(selectHistory(primaryDeviceId ?? '__none'));

  const telemetryQuery = useEnodeTelemetry(primaryDeviceId, 24);

  const streamingLive = canStreamFrontendLive(
    primaryTelemetry?.timestamp ?? fleetSite?.lastSeenAt,
    siteHealthStatus(fleetSite?.status),
  );

  const liveTelemetry = usePerceivedTelemetry(
    primaryTelemetry,
    streamingLive,
    !reducedMotion,
  );

  const perceivedFleetSite = useMemo((): FleetSite | null => {
    if (!fleetSite) return null;
    if (!streamingLive || !liveTelemetry) return fleetSite;
    return {
      ...fleetSite,
      load: liveTelemetry.load_kw,
      battery: Math.round(liveTelemetry.battery_pct),
    };
  }, [fleetSite, liveTelemetry, streamingLive]);

  const chartData = useMemo(
    (): SiteChartPoint[] =>
      buildSiteChartData(telemetryQuery.data ?? [], perceivedFleetSite ?? fleetSite),
    [fleetSite, perceivedFleetSite, telemetryQuery.data],
  );

  const inverterRows = useMemo((): SiteInverterRow[] => {
    const rows = buildSiteInverterRows(siteDevices, latestQuery.data ?? []);
    if (!streamingLive || !liveTelemetry || !primaryDeviceId) return rows;

    return rows.map((row) => {
      if (row.id !== primaryDeviceId) return row;
      return {
        ...row,
        solarKw: liveTelemetry.power_kw,
        loadKw: liveTelemetry.load_kw,
        batteryPct: Math.round(liveTelemetry.battery_pct),
      };
    });
  }, [latestQuery.data, liveTelemetry, primaryDeviceId, siteDevices, streamingLive]);

  const summaryQuery = useEnodeSiteSummary(siteId);

  const perceivedSummary = useMemo(() => {
    const summary = summaryQuery.data;
    if (!summary || !streamingLive || !liveTelemetry) return summary;
    return {
      ...summary,
      total_solar_kw: liveTelemetry.power_kw,
      total_load_kw: liveTelemetry.load_kw,
    };
  }, [liveTelemetry, streamingLive, summaryQuery.data]);

  const allAlerts = useAlertStore((state) => state.alerts);
  const alerts = useMemo(
    () => allAlerts.filter((alert) => alert.site_id === siteId && !alert.acknowledged),
    [allAlerts, siteId],
  );

  const operationalInsights = useOperationalInsights({
    anchor: primaryTelemetry,
    perceived: liveTelemetry,
    streaming: streamingLive,
    alertCount: alerts.length,
    history: chartHistory,
  });

  const inverterIntelligence = useMemo(() => {
    const primary = siteDevices[0];
    const deviceInput = primary
      ? {
          id: primary.id,
          name: primary.display_name ?? 'Inverter',
          status:
            primary.connection_status === 'error'
              ? ('fault' as const)
              : !primary.is_reachable || primary.connection_status === 'offline'
                ? ('offline' as const)
                : ('online' as const),
        }
      : null;

    return buildInverterData(
      deviceInput,
      siteMeta?.name ?? fleetSite?.name ?? 'Site',
      liveTelemetry ?? primaryTelemetry,
      streamingLive,
    );
  }, [
    fleetSite?.name,
    liveTelemetry,
    primaryTelemetry,
    siteDevices,
    siteMeta?.name,
    streamingLive,
  ]);

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchFleet(),
      devicesQuery.refetch(),
      latestQuery.refetch(),
      telemetryQuery.refetch(),
      summaryQuery.refetch(),
    ]);
  }, [devicesQuery, latestQuery, refetchFleet, summaryQuery, telemetryQuery]);

  return {
    fleetSite: perceivedFleetSite ?? fleetSite,
    siteMeta,
    chartData,
    inverterRows,
    summary: perceivedSummary,
    alerts,
    streamingLive,
    smooth: !reducedMotion,
    operationalInsights,
    sparklineSeed: fleetSite?.sparklineTrend ?? [],
    inverterIntelligence,
    isPending: fleetPending || devicesQuery.isPending,
    isFetching:
      fleetFetching ||
      devicesQuery.isFetching ||
      latestQuery.isFetching ||
      telemetryQuery.isFetching ||
      summaryQuery.isFetching,
    refetch,
  };
}
