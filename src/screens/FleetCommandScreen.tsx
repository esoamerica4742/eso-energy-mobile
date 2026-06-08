import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { FleetSiteCard } from '@/components/fleet/FleetSiteCard';
import { FleetCommandHeader } from '@/components/fleet/command/FleetCommandHeader';
import { FleetFilterBar } from '@/components/fleet/command/FleetFilterBar';
import { FleetKpiRibbon } from '@/components/fleet/command/FleetKpiRibbon';
import { LazyFleetOverviewMap } from '@/components/fleet/command/LazyFleetOverviewMap';
import { FleetViewSegment } from '@/components/fleet/command/FleetViewSegment';
import { AmbientControlAtmosphere, OperationalInsightStrip } from '@/components/perceived';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import { useFleetOperationalInsights } from '@/hooks/useFleetOperationalInsights';
import { useLiveActivityFeed } from '@/hooks/useLiveActivityFeed';
import { usePerceivedScalar } from '@/hooks/usePerceivedScalar';
import { useSitesFleet } from '@/hooks/useSitesFleet';
import { useRealtimeSiteStatus } from '@/hooks/useRealtimeSiteStatus';
import { branchRowsToFleetSites, buildFleetSummary, filterFleetSites } from '@/lib/fleetSites';
import { canStreamFrontendLive } from '@/lib/telemetryLivePerception';
import { useMotionPrefsStore } from '@/stores/motionPrefsStore';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts, spacing as themeSpacing } from '@/theme/tokens';
import type { DashboardData } from '@/types/dashboard';
import type { FleetFilter, FleetSite, FleetViewMode } from '@/types/fleet';
import { usePowerShieldCriticalPanic } from '@/esopay/hooks/usePowerShieldCriticalPanic';

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

function fleetHealthStatus(liveCount: number, siteCount: number): DashboardData['health']['status'] {
  if (siteCount === 0 || liveCount === 0) return 'offline';
  if (liveCount === siteCount) return 'live';
  return 'stale';
}

function newestFleetSyncAt(points: { updated_at?: string | null }[]): string | null {
  if (!points.length) return null;
  return points.reduce<string | null>((max, point) => {
    const ts = point.updated_at;
    if (!ts) return max;
    if (!max || new Date(ts).getTime() > new Date(max).getTime()) return ts;
    return max;
  }, null);
}

export function FleetCommandScreen({ refreshing, onRefresh }: Props) {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const sheetRef = useRef<BottomSheet>(null);
  const reducedMotion = useMotionPrefsStore((s) => s.reducedMotionEnabled);
  const [viewMode, setViewMode] = useState<FleetViewMode>('list');
  const powerShieldCrisis = usePowerShieldCriticalPanic();
  const [filter, setFilter] = useState<FleetFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const { data: branchRows, sites, isFetching } = useSitesFleet();
  useRealtimeSiteStatus();
  const devicesQuery = useEnodeDevices();
  const latestQuery = useEnodeTelemetryLatest();

  const fleetSites = useMemo(
    () => branchRowsToFleetSites(branchRows, sites, devicesQuery.data ?? [], latestQuery.data ?? []),
    [branchRows, sites, devicesQuery.data, latestQuery.data],
  );

  const filteredSites = useMemo(
    () => filterFleetSites(fleetSites, filter, query),
    [fleetSites, filter, query],
  );

  const summary = useMemo(() => buildFleetSummary(fleetSites), [fleetSites]);
  const liveCount = useMemo(() => fleetSites.filter((s) => s.status === 'live').length, [fleetSites]);

  const newestSyncAt = useMemo(
    () => newestFleetSyncAt(latestQuery.data ?? []),
    [latestQuery.data],
  );

  const streamingLive = canStreamFrontendLive(
    newestSyncAt,
    fleetHealthStatus(liveCount, summary.siteCount),
  );

  const perceivedTotalLoad = usePerceivedScalar(
    summary.totalLoadKw,
    streamingLive && liveCount > 0,
    !reducedMotion,
  );
  const perceivedAvgBattery = usePerceivedScalar(
    summary.avgBatteryPct,
    streamingLive && liveCount > 0,
    !reducedMotion,
  );

  const liveKpiMetrics = useMemo(
    () => ({
      totalLoadKw: perceivedTotalLoad,
      avgBatteryPct: perceivedAvgBattery,
      animated: streamingLive && liveCount > 0 && !reducedMotion,
    }),
    [liveCount, perceivedAvgBattery, perceivedTotalLoad, reducedMotion, streamingLive],
  );

  const headerLiveMetrics = useMemo(
    () => ({
      totalLoadKw: perceivedTotalLoad,
      animated: streamingLive && liveCount > 0 && !reducedMotion,
    }),
    [liveCount, perceivedTotalLoad, reducedMotion, streamingLive],
  );

  const summaryForDisplay = useMemo(
    () => ({
      ...summary,
      totalLoadKw: headerLiveMetrics.totalLoadKw,
    }),
    [summary, headerLiveMetrics.totalLoadKw],
  );

  const fleetInsights = useFleetOperationalInsights({
    summary: summaryForDisplay,
    sites: fleetSites,
    liveCount,
    streaming: streamingLive,
  });

  const activeInsight = useLiveActivityFeed(
    fleetInsights,
    streamingLive && !reducedMotion,
  );

  const selectedSite = useMemo(
    () =>
      filteredSites.find((site) => site.id === selectedSiteId) ??
      fleetSites.find((s) => s.id === selectedSiteId) ??
      null,
    [filteredSites, fleetSites, selectedSiteId],
  );

  const snapPoints = useMemo(() => ['24%', '46%'], []);

  const onSitePress = useCallback(
    (siteId: string) => {
      router.push(`/site/${siteId}`);
    },
    [router],
  );

  const onSelectOnMap = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    sheetRef.current?.snapToIndex(1);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FleetSite }) => (
      <FleetSiteCard
        site={item}
        onPress={() => onSitePress(item.id)}
        streamingLive={streamingLive}
        smooth={!reducedMotion}
        crisisMode={powerShieldCrisis && selectedSiteId === item.id}
      />
    ),
    [onSitePress, powerShieldCrisis, reducedMotion, selectedSiteId, streamingLive],
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <FleetCommandHeader
          summary={summary}
          liveCount={liveCount}
          streamingLive={streamingLive}
          liveMetrics={headerLiveMetrics}
        />
        <OperationalInsightStrip insight={activeInsight} streaming={streamingLive} />
        <FleetViewSegment value={viewMode} onChange={setViewMode} />
        <FleetFilterBar
          query={query}
          filter={filter}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
        />
        {viewMode === 'list' ? <FleetKpiRibbon summary={summary} liveMetrics={liveKpiMetrics} /> : null}
        {viewMode === 'list' ? <Text style={styles.section}>ALL SITES</Text> : null}
      </View>
    ),
    [
      activeInsight,
      filter,
      headerLiveMetrics,
      liveCount,
      liveKpiMetrics,
      query,
      streamingLive,
      summary,
      viewMode,
    ],
  );

  if (viewMode === 'overview') {
    return (
      <View style={styles.overviewRoot}>
        <AmbientControlAtmosphere active={streamingLive} />
        <View style={styles.overviewChrome}>
          <FleetCommandHeader
            summary={summary}
            liveCount={liveCount}
            streamingLive={streamingLive}
            liveMetrics={headerLiveMetrics}
          />
          <OperationalInsightStrip insight={activeInsight} streaming={streamingLive} />
          <FleetViewSegment value={viewMode} onChange={setViewMode} />
          <FleetFilterBar
            query={query}
            filter={filter}
            onQueryChange={setQuery}
            onFilterChange={setFilter}
          />
        </View>

        <View style={styles.mapLayer}>
          <LazyFleetOverviewMap
            active={viewMode === 'overview'}
            sites={filteredSites}
            selectedSiteId={selectedSiteId}
            onSelectSite={onSelectOnMap}
          />
        </View>

        <BottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.sheetHandle}
          bottomInset={tabBarHeight}
        >
          <BottomSheetView style={styles.sheetContent}>
            {selectedSite ? (
              <FleetSiteCard
                site={selectedSite}
                onPress={() => onSitePress(selectedSite.id)}
                compact
                streamingLive={streamingLive}
                smooth={!reducedMotion}
                crisisMode={powerShieldCrisis}
              />
            ) : (
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetTitle}>Fleet overview</Text>
                <Text style={styles.sheetCopy}>
                  Tap a site pin to inspect load, status, and inverters.
                </Text>
                <FleetKpiRibbon summary={summary} liveMetrics={liveKpiMetrics} />
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    );
  }

  return (
    <View style={styles.listRoot}>
      <AmbientControlAtmosphere active={streamingLive} />
      <FlashList
        style={styles.list}
        data={filteredSites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        drawDistance={420}
        removeClippedSubviews
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: tabBarHeight + themeSpacing.xxxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching || devicesQuery.isFetching || latestQuery.isFetching}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyFilter}>
            <Text style={styles.emptyFilterTitle}>No sites match</Text>
            <Text style={styles.emptyFilterCopy}>Try another filter or search term.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listRoot: {
    flex: 1,
    position: 'relative',
  },
  list: {
    flex: 1,
  },
  headerBlock: {
    paddingTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.semibold,
    fontSize: FontSize.label,
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  overviewRoot: {
    flex: 1,
    backgroundColor: Colors.bg,
    position: 'relative',
  },
  overviewChrome: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    zIndex: 2,
  },
  mapLayer: {
    ...StyleSheet.absoluteFill,
    top: 168,
    bottom: 0,
  },
  sheetBackground: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderColor: Colors.borderGold,
  },
  sheetHandle: {
    backgroundColor: Colors.textMuted,
    width: 42,
  },
  sheetContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  sheetEmpty: {
    gap: Spacing.sm,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  sheetCopy: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptyFilter: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyFilterTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  emptyFilterCopy: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});

export default FleetCommandScreen;