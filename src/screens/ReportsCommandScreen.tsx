import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { ReportsSkeleton } from '@/components/skeletons';
import { useReportExport } from '@/hooks/useReportExport';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { ReportExportCard } from '@/components/reports/ReportExportCard';
import { ReportsKpiStrip } from '@/components/reports/ReportsKpiStrip';
import { ReportsPerformanceHero } from '@/components/reports/ReportsPerformanceHero';
import { ReportsPeriodSegment } from '@/components/reports/ReportsPeriodSegment';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import { useSitesFleet } from '@/hooks/useSitesFleet';
import { branchRowsToFleetSites, buildFleetSummary } from '@/lib/fleetSites';
import {
  buildReportExports,
  buildReportsSnapshot,
  type ReportPeriod,
} from '@/lib/reportsData';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts, spacing as themeSpacing } from '@/theme/tokens';

export function ReportsCommandScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [period, setPeriod] = useState<ReportPeriod>('7d');
  const [refreshing, setRefreshing] = useState(false);
  const { exportReport, phaseFor } = useReportExport();
  const { data: branchRows, sites, isPending, isFetching, refetch } = useSitesFleet();
  const devicesQuery = useEnodeDevices();
  const latestQuery = useEnodeTelemetryLatest();

  const fleetSites = useMemo(
    () =>
      branchRowsToFleetSites(
        branchRows,
        sites,
        devicesQuery.data ?? [],
        latestQuery.data ?? [],
      ),
    [branchRows, devicesQuery.data, latestQuery.data, sites],
  );

  const summary = useMemo(() => buildFleetSummary(fleetSites), [fleetSites]);

  const snapshot = useMemo(
    () => buildReportsSnapshot(branchRows, summary, period),
    [branchRows, period, summary],
  );

  const exports = useMemo(
    () => buildReportExports(snapshot, fleetSites),
    [fleetSites, snapshot],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Reports</Text>
            <Text style={styles.subtitle}>
              {snapshot.exportReadyCount} exports ready · {snapshot.fleetSummary.siteCount} sites
            </Text>
          </View>
          <View style={styles.readyPill}>
            <FleetStatusPulse status="live" size="sm" />
            <Text style={styles.readyText}>READY</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + themeSpacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
      >
        <ReportsPeriodSegment value={period} onChange={setPeriod} />

        {isPending ? (
          <ReportsSkeleton />
        ) : (
          <>
            <ReportsKpiStrip snapshot={snapshot} />
            <ReportsPerformanceHero snapshot={snapshot} />

            <SectionLabel text="EXECUTIVE EXPORTS" meta={period.toUpperCase()} />
            {exports.map((item) => (
              <ReportExportCard
                key={item.id}
                item={{
                  ...item,
                  status: phaseFor(item.id) === 'exporting' ? 'scheduled' : item.status,
                }}
                onPress={() => void exportReport(item.id)}
              />
            ))}

            <SectionLabel text="OPERATIONS NOTES" />
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Reporting cadence</Text>
              <Text style={styles.noteCopy}>
                Executive summaries refresh nightly. Diesel audits compile weekly from fleet telemetry
                and grid ledger offsets.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.title,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.goldBorderStrong,
    backgroundColor: Colors.goldWhisper,
  },
  readyText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
  content: {
    paddingTop: Spacing.md,
  },
  noteCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
  },
  noteTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  noteCopy: {
    marginTop: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default ReportsCommandScreen;
