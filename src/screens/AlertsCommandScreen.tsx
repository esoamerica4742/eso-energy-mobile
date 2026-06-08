import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { FlashList } from '@shopify/flash-list';
import { Swipeable } from 'react-native-gesture-handler';
import { AlertsEmptyState } from '@/components/alerts/AlertsEmptyState';
import { AlertsFilterSegment } from '@/components/alerts/AlertsFilterSegment';
import { AlertsKpiStrip } from '@/components/alerts/AlertsKpiStrip';
import { PremiumAlertCard } from '@/components/alerts/PremiumAlertCard';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SkeletonAlertList } from '@/components/atoms/Skeleton';
import { LoadingCrossfade } from '@/components/atoms/LoadingCrossfade';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { useAcknowledgeAlert } from '@/hooks/useAcknowledgeAlert';
import { useAlerts } from '@/hooks/useAlerts';
import {
  buildAlertsSnapshot,
  filterAlerts,
  type AlertFilter,
} from '@/lib/alertsData';
import { useSiteStore } from '@/stores/siteStore';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts, spacing as themeSpacing } from '@/theme/tokens';
import type { Alert } from '@/stores/alertStore';

export function AlertsCommandScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { alerts, unreadCount, isPending, isFetching, refetch } = useAlerts();
  const dismissAlert = useAcknowledgeAlert();
  const sites = useSiteStore((s) => s.sites);
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const siteNameById = useMemo(
    () => new Map(sites.map((site) => [site.id, site.name])),
    [sites],
  );

  const snapshot = useMemo(
    () => buildAlertsSnapshot(alerts, unreadCount),
    [alerts, unreadCount],
  );

  const filteredAlerts = useMemo(
    () => filterAlerts(alerts, filter),
    [alerts, filter],
  );

  const filterCounts = useMemo(
    () => ({
      all: alerts.length,
      critical: snapshot.criticalCount,
      warning: snapshot.warningCount,
      info: snapshot.infoCount,
    }),
    [alerts.length, snapshot.criticalCount, snapshot.infoCount, snapshot.warningCount],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const onDismiss = useCallback(
    async (alertId: string) => {
      await dismissAlert(alertId);
    },
    [dismissAlert],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <AlertsKpiStrip snapshot={snapshot} />
        <AlertsFilterSegment value={filter} onChange={setFilter} counts={filterCounts} />
        <SectionLabel
          text="ACTIVE INCIDENTS"
          meta={filteredAlerts.length > 0 ? `${filteredAlerts.length} OPEN` : undefined}
        />
      </View>
    ),
    [filter, filterCounts, filteredAlerts.length, snapshot],
  );

  const renderItem = useCallback(
    ({ item }: { item: Alert }) => (
      <Swipeable
        renderRightActions={() => (
          <Pressable style={styles.dismiss} onPress={() => void onDismiss(item.id)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        )}
      >
        <PremiumAlertCard
          alert={item}
          siteName={item.site_id ? siteNameById.get(item.site_id) ?? 'Fleet site' : undefined}
        />
      </Swipeable>
    ),
    [onDismiss, siteNameById],
  );

  const pulseStatus =
    snapshot.statusTone === 'degraded'
      ? 'degraded'
      : snapshot.totalActive > 0
        ? 'live'
        : 'live';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Alerts</Text>
            <Text style={styles.subtitle}>
              {snapshot.totalActive} active · {snapshot.unreadCount} unread
            </Text>
          </View>
          <View style={[styles.statusPill, snapshot.criticalCount > 0 && styles.statusPillAlert]}>
            <FleetStatusPulse status={pulseStatus} size="sm" />
            <Text style={[styles.statusText, snapshot.criticalCount > 0 && styles.statusTextAlert]}>
              {snapshot.statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <LoadingCrossfade loading={isPending && alerts.length === 0} skeleton={<SkeletonAlertList rows={4} />}>
        <FlashList
          style={styles.list}
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          drawDistance={360}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={isPending ? null : <AlertsEmptyState filtered={filter !== 'all'} />}
          contentContainerStyle={{
            paddingBottom: tabBarHeight + themeSpacing.xxxl,
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isFetching}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </LoadingCrossfade>
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
  statusPill: {
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
  statusPillAlert: {
    borderColor: Colors.alertBorder,
    backgroundColor: Colors.alertMuted,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
  statusTextAlert: {
    color: Colors.alert,
  },
  list: {
    flex: 1,
  },
  loading: {
    paddingTop: Spacing.md,
  },
  listHeader: {
    paddingTop: Spacing.md,
  },
  separator: {
    height: Spacing.sm,
  },
  dismiss: {
    width: 96,
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.alertMuted,
    borderWidth: 1,
    borderColor: Colors.alertBorder,
  },
  dismissText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    color: Colors.alert,
    letterSpacing: 0.4,
  },
});

export default AlertsCommandScreen;
