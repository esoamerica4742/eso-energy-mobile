import { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

const LINK_DEVICE_ROUTE = '/link-device' as Href;
import { Plug } from 'lucide-react-native';
import { useEnodeDevices, ENODE_DEVICES_KEY } from '@/hooks/useEnodeDevices';
import { useEnodeDevice } from '@/hooks/useEnodeDevice';
import { useRealtimeTelemetry } from '@/hooks/useRealtimeTelemetry';
import { useSyncStatus } from '@/hooks/useTelemetryPerception';
import { useRealtimeTelemetryStore } from '@/stores/realtimeTelemetryStore';
import { useEnodeSiteSummary } from '@/hooks/useEnodeSiteSummary';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import { EnodeDeviceCard } from '@/components/enode/EnodeDeviceCard';
import { EnodePowerChart } from '@/components/enode/EnodePowerChart';
import { EnodeRetryBanner } from '@/components/enode/EnodeRetryBanner';
import { EnodeLoadingContent } from '@/components/atoms/Skeleton';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { enodeClient, EnodeApiError } from '@/services/enode';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

export function EnodeDashboardWidget() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useEnodeToast();
  const {
    data: devices = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useEnodeDevices();

  const primaryId = devices[0]?.id;
  const { data: primaryDevice } = useEnodeDevice(primaryId);
  useRealtimeTelemetry({ tenantId: primaryDevice?.company_id ?? devices[0]?.company_id, enabled: true });
  const { data: siteSummary } = useEnodeSiteSummary(primaryDevice?.branch_id ?? devices[0]?.branch_id);
  const wsConnected = useRealtimeTelemetryStore((s) => s.wsConnected);
  const lastSyncAt = useRealtimeTelemetryStore((s) => s.lastSyncAt);
  const sync = useSyncStatus(lastSyncAt, 300_000);

  const errorMessage = useMemo(() => {
    if (!isError) return null;
    if (error instanceof EnodeApiError && error.status === 401) {
      return 'Sign in to connect Enode devices';
    }
    return 'Unable to reach Enode — showing last known data';
  }, [isError, error]);

  const onRefresh = useCallback(async () => {
    try {
      await enodeClient.syncAll();
      await refetch();
      toast.show('Devices synced', 'success');
    } catch {
      await refetch();
      toast.show('Sync failed — pull to retry', 'warning');
    }
  }, [refetch, toast]);

  const onRetry = useCallback(() => {
    void onRefresh();
  }, [onRefresh]);

  if (isLoading && devices.length === 0) {
    return <EnodeLoadingContent />;
  }

  if (!isLoading && devices.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <SectionLabel text="ENODE DEVICES" meta="NOT CONNECTED" />
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => router.push(LINK_DEVICE_ROUTE)}
        >
          <Plug size={20} color={colors.textAccent} />
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Connect inverter or charger</Text>
            <Text style={styles.ctaSub}>
              Secure OAuth via Enode — same flow as Stripe Connect
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  const device = primaryDevice ?? devices[0];

  return (
    <View style={styles.wrap}>
      <SectionLabel
        text="ENODE LIVE"
        meta={wsConnected ? (device?.connection_status?.toUpperCase() ?? 'SYNCING') : 'RECONNECTING'}
      />
      <View style={styles.syncBar}>
        <Text style={[styles.syncText, sync.syncingSoon && styles.syncTextActive]}>{sync.label}</Text>
      </View>
      {siteSummary ? (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>{`Online ${siteSummary.online_count}/${siteSummary.device_count}`}</Text>
          <Text style={styles.summaryText}>{`Faults ${siteSummary.fault_count}`}</Text>
          <Text style={styles.summaryText}>{`${Number(siteSummary.total_solar_kw).toFixed(1)} kW`}</Text>
        </View>
      ) : null}
      {errorMessage ? (
        <EnodeRetryBanner
          message={errorMessage}
          onRetry={onRetry}
          loading={isFetching}
        />
      ) : null}
      {device ? (
        <>
          <View style={styles.cardPad}>
            <EnodeDeviceCard
              device={device}
              onPress={() => router.push(LINK_DEVICE_ROUTE)}
            />
          </View>
          <EnodePowerChart deviceId={device.id} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  emptyWrap: { marginBottom: spacing.lg },
  cardPad: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  syncBar: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,17,24,0.85)',
  },
  syncText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.2,
  },
  syncTextActive: {
    color: '#10B981',
  },
  summaryRow: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(10,12,18,0.72)',
  },
  summaryText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    fontVariant: ['tabular-nums'],
  },
  cta: {
    marginHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  ctaPressed: { backgroundColor: colors.bgElevated },
  ctaText: { flex: 1 },
  ctaTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  ctaSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
    marginTop: 4,
  },
});
