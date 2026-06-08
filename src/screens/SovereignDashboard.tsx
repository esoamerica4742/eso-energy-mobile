import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href, useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { SovereignTopNav } from '@/components/dashboard/SovereignTopNav';
import { SiteSelector } from '@/components/dashboard/SiteSelector';
import { EnergyOrchestrationLayer } from '@/components/dashboard/EnergyOrchestrationLayer';
import { NetDailySavingsCard } from '@/components/dashboard/NetDailySavingsCard';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { LiveChart } from '@/components/dashboard/LiveChart';
import { DeviceCard } from '@/components/dashboard/DeviceCard';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { FleetCommandRadar } from '@/components/dashboard/FleetCommandRadar';
import { DieselOffsetMonitor } from '@/components/dashboard/DieselOffsetMonitor';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { InverterIntelligenceModule } from '@/screens/InverterIntelligenceScreen';
import { useEnodeDashboardDevices } from '@/hooks/useEnodeDashboardDevices';
import { useEnodeDashboardTelemetry } from '@/hooks/useEnodeDashboardTelemetry';
import { useAiInsights } from '@/hooks/useAiInsights';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore, selectActiveSite } from '@/stores/siteStore';
import { useAlertStore } from '@/stores/alertStore';
import { useMotionPrefsStore } from '@/stores/motionPrefsStore';
import { useTelemetryStore, selectLatest } from '@/stores/telemetryStore';
import { buildInverterData } from '@/lib/mapInverterData';
import { enodeClient } from '@/services/enode';
import type { TelemetryPoint } from '@/stores/telemetryStore';
import { colors, fontSize, fonts, spacing } from '@/theme/tokens';

function computeSavings(point: TelemetryPoint | null | undefined) {
  const powerKw = point?.power_kw ?? 312.4;
  const loadKw = point?.load_kw ?? 420.5;
  const batteryPct = point?.battery_pct ?? 78;
  const dailySavings = Math.round(powerKw * 152870);
  const monthToDate = Math.round(dailySavings * 27.2);
  const dieselAvoided = Math.round(batteryPct * 4.48);
  const solarShare = Math.max(0, Math.min(100, Math.round(batteryPct * 0.95)));
  const vsAvg = Math.max(0, Math.min(100, loadKw * 0.9));
  return { dailySavings, monthToDate, dieselAvoided, solarShare, vsAvg };
}

export function SovereignDashboard() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const companyId = useAuthStore(selectTenantId);
  const sites = useSiteStore((s) => s.sites);
  const activeSite = useSiteStore(selectActiveSite);
  const reducedMotion = useMotionPrefsStore((s) => s.reducedMotionEnabled);
  const latestIncident = useAlertStore((s) => s.alerts[0] ?? null);

  const devicesQuery = useEnodeDashboardDevices(activeSite?.id);
  const devices = devicesQuery.data;
  const primaryDevice = devices[0] ?? null;
  const deviceIds = useMemo(() => devices.map((d) => d.id), [devices]);
  const primaryTelemetry = useTelemetryStore(selectLatest(primaryDevice?.id ?? '__none'));

  useEnodeDashboardTelemetry({
    siteId: activeSite?.id,
    companyId,
    deviceIds,
    enodeDevices: devicesQuery.enodeDevices,
    enabled: Boolean(activeSite?.id) && deviceIds.length > 0,
  });

  const insightsQuery = useAiInsights(deviceIds);
  const savings = useMemo(() => computeSavings(primaryTelemetry), [primaryTelemetry]);
  const inverterData = useMemo(
    () =>
      buildInverterData(
        primaryDevice ? { id: primaryDevice.id, name: primaryDevice.name } : null,
        activeSite?.name ?? 'Fleet site',
        primaryTelemetry,
        primaryDevice?.status === 'online',
      ),
    [activeSite?.name, primaryDevice, primaryTelemetry],
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await enodeClient.syncAll();
      await devicesQuery.refetch();
    } catch {
      await devicesQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [devicesQuery]);

  useFocusEffect(
    useCallback(() => {
      void devicesQuery.refetch();
    }, [devicesQuery]),
  );

  const emptyVariant =
    sites.length > 1 ? ('no_inverters_multi_site' as const) : ('no_inverters' as const);

  if (!devicesQuery.isPending && devices.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[styles.emptyScroll, { paddingBottom: tabBarHeight + spacing.xl }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.solarDot, colors.gridDot, colors.dieselDot]}
            progressBackgroundColor={colors.bgSurface}
          />
        }
      >
        <SovereignTopNav reducedMotion={reducedMotion} />
        <EmptyDashboard
          variant={emptyVariant}
          siteName={activeSite?.name}
          siteCount={sites.length}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: tabBarHeight + spacing.xxxl }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.gold}
          colors={[colors.solarDot, colors.gridDot, colors.dieselDot]}
          progressBackgroundColor={colors.bgSurface}
        />
      }
    >
      <View style={styles.block}>
        <SovereignTopNav reducedMotion={reducedMotion} />
      </View>

      <View style={styles.block}>
        <SiteSelector />
      </View>

      {primaryTelemetry?.battery_pct != null ? (
        <View style={styles.block}>
          <EnergyOrchestrationLayer
            batterySoc={primaryTelemetry.battery_pct}
            reducedMotion={reducedMotion}
          />
        </View>
      ) : null}

      <View style={styles.block}>
        <NetDailySavingsCard
          loading={devicesQuery.isPending}
          dailySavings={savings.dailySavings}
          vsAvg={savings.vsAvg}
          monthToDate={savings.monthToDate}
          dieselAvoided={savings.dieselAvoided}
          solarShare={savings.solarShare}
        />
      </View>

      {primaryDevice ? (
        <>
          <SectionLabel text="Live telemetry" meta={primaryDevice.name} />
          <View style={styles.block}>
            <StatusCard deviceId={primaryDevice.id} deviceName={primaryDevice.name} />
          </View>
          <View style={styles.block}>
            <LiveChart deviceId={primaryDevice.id} />
          </View>
        </>
      ) : null}

      {devices.length > 0 ? (
        <>
          <SectionLabel text="Fleet assets" meta={`${devices.length} connected`} />
          <View style={styles.deviceList}>
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onPress={() => router.push(`/site/${activeSite?.id ?? device.site_id}` as Href)}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.block}>
        <InverterIntelligenceModule data={inverterData} embedded />
      </View>

      <View style={styles.block}>
        <AIInsightsCard
          insights={insightsQuery.data ?? []}
          isLoading={insightsQuery.isPending}
        />
      </View>

      <View style={styles.block}>
        <FleetCommandRadar reducedMotion={reducedMotion} />
      </View>

      <View style={styles.block}>
        <DieselOffsetMonitor
          offsetNaira={savings.dailySavings}
          litersPrevented={savings.dieselAvoided}
          incident={latestIncident}
          reducedMotion={reducedMotion}
        />
      </View>

      {activeSite?.name ? (
        <Text style={styles.siteContext}>{`${activeSite.name} · Live monitoring`}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  emptyScroll: {
    flexGrow: 1,
    minHeight: '100%',
  },
  block: {
    marginBottom: spacing.md,
  },
  deviceList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  siteContext: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    letterSpacing: 0.6,
  },
});
