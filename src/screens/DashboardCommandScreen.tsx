/**
 * Main Dashboard — gold-standard command scroll (monitoring only).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardLoadingContent } from '@/components/atoms/Skeleton';
import { LoadingCrossfade } from '@/components/atoms/LoadingCrossfade';
import {
  DashboardDeviceSection,
  DashboardGuardSection,
} from '@/components/dashboard/command/DashboardLiveSections';
import { DashboardIntelligenceSection } from '@/components/dashboard/command/DashboardIntelligenceSection';
import { DashboardCommandHeader } from '@/components/dashboard/command/DashboardCommandHeader';
import { useFleetIntelligence } from '@/hooks/useFleetIntelligence';
import { InverterChipRow } from '@/components/dashboard/command/InverterChipRow';
import { DashboardKpiStrip } from '@/components/dashboard/command/DashboardKpiStrip';
import { DashboardSection } from '@/components/dashboard/command/DashboardSection';
import { EmptyDashboard, type EmptyDashboardVariant } from '@/components/dashboard/EmptyDashboard';
import { MonitorFleetHeader, type MonitorConnectionTone } from '@/components/dashboard/MonitorFleetHeader';
import { SovereignTopNav } from '@/components/dashboard/SovereignTopNav';
import { useEnodeLink } from '@/hooks/useEnodeLink';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import {
  AmbientControlAtmosphere,
  OperationalInsightStrip,
} from '@/components/perceived';
import { GoldStandardDashboard } from '@/screens/GoldStandardDashboard';
import { useEnodeDashboardDevices } from '@/hooks/useEnodeDashboardDevices';
import { useSiteTelemetryStream } from '@/hooks/useSiteTelemetryStream';
import { useRelativeSyncClock } from '@/hooks/useRelativeSyncClock';
import { useMonitorAlerts } from '@/hooks/useMonitorAlerts';
import { resolveMonitorConnectionStatus } from '@/lib/monitor/connectionStatus';
import { useLiveActivityFeed } from '@/hooks/useLiveActivityFeed';
import { useOperationalInsights } from '@/hooks/useOperationalInsights';
import { buildDashboardCommandSnapshot } from '@/lib/dashboardCommandData';
import { buildBatteryLifespanGuard } from '@/lib/batteryLifespanGuard';
import { buildContractorAuditSnapshot } from '@/lib/contractorAuditData';
import { buildThermalLoadStressAlert } from '@/lib/thermalLoadStressAlert';
import { buildDieselFraudAuditHub } from '@/lib/dieselFraudAuditData';
import { buildDashboardData, computeDailySavings } from '@/lib/mapDashboardData';
import { applyLiveDisplayMetrics, canStreamFrontendLive } from '@/lib/telemetryLivePerception';
import { usePerceivedTelemetry } from '@/hooks/usePerceivedTelemetry';
import { buildInverterData } from '@/lib/mapInverterData';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { buildTelemetryData } from '@/lib/mapTelemetryData';
import { enodeClient } from '@/services/enode';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useMotionPrefsStore } from '@/stores/motionPrefsStore';
import { useSiteStore, selectActiveSite } from '@/stores/siteStore';
import { Colors, MonitoringLayout, Spacing } from '@/tokens/design';

export function DashboardCommandScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const companyId = useAuthStore(selectTenantId);
  const authLoading = useAuthStore((s) => s.loading);
  const sites = useSiteStore((s) => s.sites);
  const activeSite = useSiteStore(selectActiveSite);
  const { unreadCount } = useMonitorAlerts();
  const syncTick = useRelativeSyncClock();
  const [emptyRefreshing, setEmptyRefreshing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const enodeLink = useEnodeLink();
  const toast = useEnodeToast();
  const reducedMotion = useMotionPrefsStore((s) => s.reducedMotionEnabled);
  const isDemoMode = useDemoModeActive();

  const {
    data: devices,
    enodeDevices,
    isPending: devicesPending,
    isFetching: devicesFetching,
    refetch: refetchDevices,
  } = useEnodeDashboardDevices(activeSite?.id);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const first = devices[0]?.id ?? null;
    if (!first) {
      setSelectedDeviceId(null);
      return;
    }
    setSelectedDeviceId((prev) => (prev && devices.some((d) => d.id === prev) ? prev : first));
  }, [devices, activeSite?.id]);

  const selectedDevice = useMemo(() => {
    if (!selectedDeviceId) return devices[0] ?? null;
    return devices.find((d) => d.id === selectedDeviceId) ?? devices[0] ?? null;
  }, [devices, selectedDeviceId]);

  const primaryDevice = selectedDevice;
  const deviceIds = useMemo(() => devices.map((device) => device.id), [devices]);

  const telemetryStream = useSiteTelemetryStream({
    siteId: activeSite?.id,
    companyId,
    deviceIds,
    enodeDevices,
    primaryDeviceId: selectedDeviceId ?? primaryDevice?.id,
    enabled: Boolean(activeSite?.id) && deviceIds.length > 0,
  });

  const primaryTelemetry = telemetryStream.latestReading;
  const chartHistory = telemetryStream.readings;

  const monitorConnection = useMemo(
    () =>
      resolveMonitorConnectionStatus({
        devices,
        lastTelemetryAt: primaryTelemetry?.timestamp,
        streamPaused: telemetryStream.isStale,
      }),
    [devices, primaryTelemetry?.timestamp, syncTick, telemetryStream.isStale],
  );

  const dashboardData = useMemo(
    () =>
      buildDashboardData(
        activeSite?.name,
        primaryTelemetry
          ? {
              siteId: activeSite?.id,
              load_kw: primaryTelemetry.load_kw,
              battery_pct: primaryTelemetry.battery_pct,
              power_kw: primaryTelemetry.power_kw,
              temperature_c: primaryTelemetry.temperature_c,
              timestamp: primaryTelemetry.timestamp,
              deviceStatus:
                primaryDevice?.status === 'fault'
                  ? 'fault'
                  : primaryDevice?.status === 'maintenance'
                    ? 'maintenance'
                    : primaryDevice?.status === 'offline'
                      ? 'offline'
                      : 'online',
            }
          : null,
        { hasDevice: Boolean(primaryDevice), history: chartHistory },
      ),
    [activeSite?.id, activeSite?.name, primaryDevice, primaryTelemetry, chartHistory],
  );

  const streamingLive =
    telemetryStream.isLive ||
    canStreamFrontendLive(
      primaryTelemetry?.timestamp ?? dashboardData.health.updatedAt,
      dashboardData.health.status,
    );

  const liveTelemetry = usePerceivedTelemetry(
    primaryTelemetry,
    streamingLive,
    !reducedMotion,
  );

  const displayDashboardData = useMemo(
    () => applyLiveDisplayMetrics(dashboardData, liveTelemetry, streamingLive),
    [dashboardData, liveTelemetry, streamingLive],
  );

  const liveKpiMetrics = useMemo(
    () => ({
      batteryPct: liveTelemetry?.battery_pct ?? dashboardData.battery.soc,
      loadKw: liveTelemetry?.load_kw ?? primaryTelemetry?.load_kw ?? 0,
      solarKw: liveTelemetry?.power_kw ?? primaryTelemetry?.power_kw ?? 0,
      animated: streamingLive && !reducedMotion,
    }),
    [
      dashboardData.battery.soc,
      liveTelemetry,
      primaryTelemetry?.load_kw,
      primaryTelemetry?.power_kw,
      reducedMotion,
      streamingLive,
    ],
  );

  const operationalInsights = useOperationalInsights({
    anchor: primaryTelemetry,
    perceived: liveTelemetry,
    streaming: streamingLive,
    alertCount: unreadCount,
    history: chartHistory,
  });

  const activeInsight = useLiveActivityFeed(
    operationalInsights,
    streamingLive && !reducedMotion,
  );

  const snapshot = useMemo(
    () =>
      buildDashboardCommandSnapshot({
        data: displayDashboardData,
        loadKw: liveTelemetry?.load_kw ?? primaryTelemetry?.load_kw,
        solarKw: liveTelemetry?.power_kw ?? primaryTelemetry?.power_kw,
        deviceCount: devices.length,
        alertCount: unreadCount,
        connection: monitorConnection,
        lastSyncAt: primaryTelemetry?.timestamp,
        isDemoMode,
      }),
    [
      displayDashboardData,
      devices.length,
      isDemoMode,
      liveTelemetry?.load_kw,
      liveTelemetry?.power_kw,
      monitorConnection,
      primaryTelemetry?.load_kw,
      primaryTelemetry?.power_kw,
      primaryTelemetry?.timestamp,
      syncTick,
      unreadCount,
    ],
  );

  const inverterData = useMemo(
    () =>
      buildInverterData(
        primaryDevice,
        activeSite?.name ?? 'Fleet site',
        liveTelemetry ?? primaryTelemetry,
        streamingLive,
      ),
    [activeSite?.name, liveTelemetry, primaryDevice, primaryTelemetry, streamingLive],
  );

  const fallbackInverterData = useMemo(
    () =>
      buildInverterData(
        null,
        activeSite?.name ?? 'Fleet site',
        liveTelemetry ?? primaryTelemetry,
        false,
      ),
    [activeSite?.name, liveTelemetry, primaryTelemetry],
  );

  const fallbackChartData = useMemo(
    () =>
      buildTelemetryData(chartHistory, liveTelemetry ?? primaryTelemetry, {
        streaming: false,
      }),
    [chartHistory, liveTelemetry, primaryTelemetry],
  );

  const chartData = useMemo(
    () =>
      buildTelemetryData(chartHistory, liveTelemetry ?? primaryTelemetry, {
        streaming: streamingLive,
      }),
    [chartHistory, liveTelemetry, primaryTelemetry, streamingLive],
  );

  const batteryGuard = useMemo(
    () =>
      buildBatteryLifespanGuard({
        live: streamingLive,
        socPct: liveTelemetry?.battery_pct ?? primaryTelemetry?.battery_pct ?? dashboardData.battery.soc,
        temperatureC: liveTelemetry?.temperature_c ?? primaryTelemetry?.temperature_c,
        history: chartHistory,
        deviceId: primaryDevice?.id,
      }),
    [
      chartHistory,
      dashboardData.battery.soc,
      liveTelemetry,
      primaryDevice?.id,
      primaryTelemetry?.battery_pct,
      primaryTelemetry?.temperature_c,
      streamingLive,
    ],
  );

  const contractorAudit = useMemo(
    () =>
      buildContractorAuditSnapshot({
        live: streamingLive,
        siteId: activeSite?.id,
        siteName: activeSite?.name,
        loadKw: liveTelemetry?.load_kw ?? primaryTelemetry?.load_kw,
        powerKw: liveTelemetry?.power_kw ?? primaryTelemetry?.power_kw,
        deviceCount: devices.length,
        alertCount: unreadCount,
        dailySavings: displayDashboardData.kpi.primaryValue,
        history: chartHistory,
      }),
    [
      activeSite?.id,
      activeSite?.name,
      chartHistory,
      displayDashboardData.kpi.primaryValue,
      devices.length,
      liveTelemetry,
      primaryTelemetry?.load_kw,
      primaryTelemetry?.power_kw,
      streamingLive,
      unreadCount,
    ],
  );

  const thermalLoadStress = useMemo(
    () =>
      buildThermalLoadStressAlert({
        live: streamingLive,
        temperatureC: liveTelemetry?.temperature_c ?? primaryTelemetry?.temperature_c,
        loadKw: liveTelemetry?.load_kw ?? primaryTelemetry?.load_kw,
        powerKw: liveTelemetry?.power_kw ?? primaryTelemetry?.power_kw,
        history: chartHistory,
        deviceId: primaryDevice?.id,
      }),
    [
      chartHistory,
      liveTelemetry,
      primaryDevice?.id,
      primaryTelemetry?.load_kw,
      primaryTelemetry?.power_kw,
      primaryTelemetry?.temperature_c,
      streamingLive,
    ],
  );

  const dieselFraudAudit = useMemo(() => {
    const dieselMetric = displayDashboardData.kpi.subMetrics.find((m) => m.label === 'DIESEL AVOIDED');
    return buildDieselFraudAuditHub({
      live: streamingLive,
      siteId: activeSite?.id,
      loadKw: liveTelemetry?.load_kw ?? primaryTelemetry?.load_kw,
      powerKw: liveTelemetry?.power_kw ?? primaryTelemetry?.power_kw,
      dieselAvoidedLiters: dieselMetric?.rawValue,
      alertCount: unreadCount,
      history: chartHistory,
    });
  }, [
    activeSite?.id,
    chartHistory,
    displayDashboardData.kpi.subMetrics,
    liveTelemetry,
    primaryTelemetry?.load_kw,
    primaryTelemetry?.power_kw,
    streamingLive,
    unreadCount,
  ]);

  const fleetIntelligence = useFleetIntelligence({
    deviceIds,
    primaryDeviceId: primaryDevice?.id,
    streamingLive,
    telemetry: liveTelemetry ?? primaryTelemetry,
    history: chartHistory,
    alertCount: unreadCount,
    guards: {
      batteryStatus: batteryGuard.status,
      dieselStatus: dieselFraudAudit.status,
      thermalStatus: thermalLoadStress.status,
    },
  });

  const telemetryMeta = monitorConnection.label;
  const sectionChartLoading = !telemetryStream.isReady && devices.length > 0;
  const sectionInverterLoading = devicesPending && devices.length > 0;
  const faultTint = monitorConnection.state === 'fault';

  const refreshEmptyData = useCallback(async () => {
    setEmptyRefreshing(true);
    try {
      await refetchDevices();
    } finally {
      setEmptyRefreshing(false);
    }
  }, [refetchDevices]);

  const monitorConnectionTone: MonitorConnectionTone = useMemo(() => {
    if (monitorConnection.state === 'live') return 'live';
    if (devices.length > 0) return 'online';
    return 'offline';
  }, [devices.length, monitorConnection.state]);

  const monitorSyncLabel = useMemo(() => {
    if (monitorConnection.state === 'live') return snapshot.lastSyncLabel;
    if (devices.length > 0) return 'Linked · awaiting telemetry';
    return 'Awaiting sync';
  }, [devices.length, monitorConnection.state, snapshot.lastSyncLabel]);

  const startEnodeLink = useCallback(async () => {
    try {
      const result = await enodeLink.mutateAsync();
      if (result.status === 'linked') {
        toast.show('Inverter connected', 'success');
        await refetchDevices();
        return;
      }
      if (result.status === 'cancelled') {
        toast.show('Connection cancelled', 'info');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      toast.show(msg, 'error');
    }
  }, [enodeLink, refetchDevices, toast]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await enodeClient.syncAll();
      await Promise.all([refetchDevices(), fleetIntelligence.refetch()]);
    } catch {
      await Promise.all([refetchDevices(), fleetIntelligence.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [fleetIntelligence, refetchDevices]);

  const hasSites = sites.length > 0;
  const showEmptyDashboard = !hasSites;
  const emptyVariant: EmptyDashboardVariant = 'no_sites';
  const isBootLoading = authLoading && !isDemoMode;
  const scrollBottomPad = tabBarHeight + Spacing.xl;

  if (isBootLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingCrossfade loading skeleton={<DashboardLoadingContent />}>
          <View style={styles.loadingWrap} />
        </LoadingCrossfade>
      </SafeAreaView>
    );
  }

  if (showEmptyDashboard) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <MonitorFleetHeader
          inverterCount={devices.length}
          syncLabel={monitorSyncLabel}
          connectionTone={monitorConnectionTone}
        />
        <ScrollView
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={emptyRefreshing || devicesFetching}
              onRefresh={refreshEmptyData}
              tintColor={Colors.gold}
            />
          }
        >
          <EmptyDashboard
            variant={emptyVariant}
            siteName={activeSite?.name}
            siteCount={sites.length}
            onPrimaryAction={startEnodeLink}
            primaryLoading={enodeLink.isPending}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const noInvertersVariant: EmptyDashboardVariant =
    sites.length > 1 ? 'no_inverters_multi_site' : 'no_inverters';

  if (!devicesPending && devices.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <MonitorFleetHeader
          inverterCount={0}
          syncLabel={monitorSyncLabel}
          connectionTone={monitorConnectionTone}
        />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || devicesFetching}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
            />
          }
        >
          <DashboardKpiStrip snapshot={snapshot} />

          <DashboardSection title="ENERGY CORE" meta={snapshot.statusLabel}>
            <GoldStandardDashboard data={displayDashboardData} showBottomNav={false} embedded />
          </DashboardSection>

          <View style={styles.emptyPad}>
            <DashboardDeviceSection
              inverterData={fallbackInverterData}
              chartData={fallbackChartData}
              dieselFraudAudit={dieselFraudAudit}
              streamingLive={false}
              smooth={!reducedMotion}
              telemetryMeta="OFFLINE"
            />
            <DashboardIntelligenceSection
              insights={fleetIntelligence.insights}
              isLoading={fleetIntelligence.isLoading}
              sourceMix={fleetIntelligence.sourceMix}
              streamingLive={false}
            />
            <EmptyDashboard
              variant={noInvertersVariant}
              siteName={activeSite?.name}
              siteCount={sites.length}
              onPrimaryAction={startEnodeLink}
              primaryLoading={enodeLink.isPending}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AmbientControlAtmosphere active={streamingLive} />
      <MonitorFleetHeader
        inverterCount={devices.length}
        syncLabel={monitorSyncLabel}
        connectionTone={monitorConnectionTone}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing || devicesFetching}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
      >
        <DashboardKpiStrip snapshot={snapshot} liveMetrics={liveKpiMetrics} />
        <InverterChipRow
          devices={devices}
          selectedId={selectedDeviceId ?? primaryDevice?.id ?? null}
          onSelect={setSelectedDeviceId}
        />
        <OperationalInsightStrip insight={activeInsight} streaming={streamingLive} />

        <DashboardSection title="ENERGY CORE" meta={snapshot.statusLabel}>
          <GoldStandardDashboard data={displayDashboardData} showBottomNav={false} embedded />
        </DashboardSection>

        {primaryDevice ? (
          <DashboardDeviceSection
            inverterData={inverterData}
            chartData={chartData}
            dieselFraudAudit={dieselFraudAudit}
            streamingLive={streamingLive}
            smooth={!reducedMotion}
            telemetryMeta={telemetryMeta}
            chartLoading={sectionChartLoading}
            inverterLoading={sectionInverterLoading}
            faultTint={faultTint}
          />
        ) : null}

        <DashboardIntelligenceSection
          insights={fleetIntelligence.insights}
          isLoading={fleetIntelligence.isLoading}
          sourceMix={fleetIntelligence.sourceMix}
          streamingLive={streamingLive}
        />

        <DashboardGuardSection
          batteryGuard={batteryGuard}
          contractorAudit={contractorAudit}
          thermalLoadStress={thermalLoadStress}
          streamingLive={streamingLive}
          smooth={!reducedMotion}
          loading={devicesPending && !telemetryStream.isReady}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
    position: 'relative',
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingTop: Spacing.xs,
    gap: MonitoringLayout.scrollGap,
  },
  emptyScrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  emptyPad: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  loadingWrap: {
    paddingTop: Spacing.md,
  },
});

export default DashboardCommandScreen;
