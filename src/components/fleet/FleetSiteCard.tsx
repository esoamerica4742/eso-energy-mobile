import { memo, useCallback, useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import * as Haptics from 'expo-haptics';

import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';

import { PerceivedMiniSparkline } from '@/components/perceived/PerceivedMiniSparkline';
import { AnimatedMetric } from '@/components/perceived/AnimatedMetric';
import { usePerceivedScalar } from '@/hooks/usePerceivedScalar';

import { MetricChip } from '@/components/sites/MetricChip';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/tokens/design';
import { fonts, spacing as themeSpacing } from '@/theme/tokens';

import { statusAccessibilityLabel } from '@/lib/telemetryStatus';

import type { FleetSite } from '@/types/fleet';



type Props = {
  site: FleetSite;
  onPress: () => void;
  compact?: boolean;
  streamingLive?: boolean;
  smooth?: boolean;
  /** Power Shield 5% critical panic — crimson flash on active site card. */
  crisisMode?: boolean;
};



const STATUS_COPY = {

  live: { label: 'Live', color: Colors.battery },

  degraded: { label: 'Stale', color: Colors.warning },

  offline: { label: 'Offline', color: Colors.alert },

} as const;



function mapFleetStatus(status: FleetSite['status']) {

  if (status === 'degraded') return 'stale' as const;

  if (status === 'offline') return 'offline' as const;

  return 'live' as const;

}



function formatLoad(load: number) {

  if (load >= 1000) return `${(load / 1000).toFixed(1)} MW`;

  return `${Math.round(load)} kW`;

}



function formatLoadMetric(load: number) {
  if (load >= 1000) return `${(load / 1000).toFixed(1)} MW`;
  return `${Math.round(load)} kW`;
}

const CRISIS_BORDER = 'rgba(220, 38, 38, 0.7)';
const CRISIS_BG = 'rgba(69, 10, 10, 0.42)';

export const FleetSiteCard = memo(function FleetSiteCard({
  site,
  onPress,
  compact = false,
  streamingLive = false,
  smooth = true,
  crisisMode = false,
}: Props) {
  const siteStreaming = streamingLive && site.status === 'live';
  const perceivedLoad = usePerceivedScalar(site.load, siteStreaming, smooth);
  const perceivedBattery = usePerceivedScalar(site.battery, siteStreaming, smooth);

  const status = STATUS_COPY[site.status];

  const connectionStatus = mapFleetStatus(site.status);

  const muted = site.status !== 'live';

  const lastSeenLabel = site.lastSeenAt ? `Last seen ${site.lastSeenLabel}` : undefined;



  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!crisisMode) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [crisisMode, pulse]);

  const crisisAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handlePress = useCallback(() => {

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    onPress();

  }, [onPress]);



  return (

    <Animated.View style={crisisMode ? crisisAnim : undefined}>

    <Pressable

      style={({ pressed }) => [

        styles.card,

        site.status === 'degraded' && styles.cardStale,

        site.status === 'offline' && styles.cardOffline,

        crisisMode && styles.cardCrisis,

        compact && styles.cardCompact,

        pressed && styles.cardPressed,

      ]}

      onPress={handlePress}

      accessibilityRole="button"

      accessibilityLabel={statusAccessibilityLabel(connectionStatus, site.name, site.lastSeenAt)}

      accessibilityHint="Opens site detail"

    >

      <View style={styles.header}>

        <View style={styles.titleRow}>

          <FleetStatusPulse status={site.status} size="sm" />

          <View style={styles.titleBlock}>

            <Text style={styles.name}>{site.name}</Text>

            <View style={styles.metaRow}>

              <Text style={styles.cityChip}>{site.city}</Text>

              {!compact && lastSeenLabel ? <Text style={styles.lastSeen}>{lastSeenLabel}</Text> : null}

            </View>

          </View>

        </View>

        <View style={[styles.badge, { borderColor: `${status.color}55`, backgroundColor: `${status.color}18` }]}>

          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>

        </View>

      </View>



      <View style={styles.heroRow}>

        <View style={styles.heroMetric}>

          {siteStreaming ? (
            <AnimatedMetric
              value={perceivedLoad}
              format={formatLoadMetric}
              durationMs={1800}
              style={[styles.heroValue, muted && styles.heroValueMuted]}
            />
          ) : (
            <Text style={[styles.heroValue, muted && styles.heroValueMuted]}>{formatLoad(site.load)}</Text>
          )}

          <Text style={styles.heroLabel}>Load draw</Text>

        </View>

        <PerceivedMiniSparkline
          metricValue={siteStreaming ? perceivedLoad : site.load}
          seed={site.sparklineTrend}
          streaming={siteStreaming}
          smooth={smooth}
          status={site.status}
        />

      </View>



      {!compact ? (

        <View style={styles.metrics}>

          <MetricChip
            label="Battery"
            value={
              siteStreaming
                ? `${Math.round(perceivedBattery)}%`
                : `${site.battery}%`
            }
            muted={muted}
          />

          <MetricChip label="Uptime" value={`${site.uptime}%`} muted={muted} />

          <MetricChip label="Inverters" value={`${site.onlineInverters}/${site.inverterCount}`} muted={muted} />

          <MetricChip label="Alerts" value={`${site.alerts}`} muted={muted} />

        </View>

      ) : null}

    </Pressable>

    </Animated.View>

  );

});



const styles = StyleSheet.create({

  card: {

    backgroundColor: Colors.surface,

    borderRadius: Radius.lg,

    borderWidth: 1,

    borderColor: Colors.borderGold,

    padding: Spacing.md,

    marginBottom: Spacing.sm,

    minHeight: 44,

    ...Shadow.card,

  },

  cardCompact: {

    marginBottom: 0,

  },

  cardStale: {

    borderColor: 'rgba(201,168,76,0.45)',

    ...Shadow.goldGlow,

  },

  cardOffline: {

    borderColor: Colors.borderSubtle,

    opacity: 0.92,

  },

  cardCrisis: {
    borderColor: CRISIS_BORDER,
    borderWidth: 2,
    backgroundColor: CRISIS_BG,
  },

  cardPressed: {

    transform: [{ scale: 0.985 }],

    borderColor: Colors.goldBorderStrong,

  },

  header: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    marginBottom: Spacing.md,

    gap: Spacing.sm,

  },

  titleRow: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: Spacing.sm,

    flex: 1,

  },

  titleBlock: {

    flex: 1,

  },

  name: {

    fontFamily: fonts.bold,

    fontSize: FontSize.sub,

    color: Colors.textPrimary,

  },

  metaRow: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    alignItems: 'center',

    gap: 8,

    marginTop: 4,

  },

  cityChip: {

    fontFamily: fonts.medium,

    fontSize: FontSize.label,

    color: Colors.gold,

    letterSpacing: 0.6,

    textTransform: 'uppercase',

  },

  lastSeen: {

    fontFamily: fonts.regular,

    fontSize: FontSize.label,

    color: Colors.textMuted,

  },

  badge: {

    borderRadius: Radius.pill,

    borderWidth: 1,

    paddingHorizontal: 10,

    paddingVertical: 6,

    minHeight: 28,

    justifyContent: 'center',

  },

  badgeText: {

    fontFamily: fonts.semibold,

    fontSize: FontSize.label,

    letterSpacing: 0.5,

  },

  heroRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: Spacing.md,

    gap: Spacing.md,

  },

  heroMetric: {

    flex: 1,

  },

  heroValue: {

    fontFamily: fonts.bold,

    fontSize: FontSize.unit,

    color: Colors.textPrimary,

    fontVariant: ['tabular-nums'],

  },

  heroValueMuted: {

    color: Colors.textMuted,

  },

  heroLabel: {

    marginTop: 2,

    fontFamily: fonts.regular,

    fontSize: FontSize.label,

    color: Colors.textMuted,

    letterSpacing: 0.8,

    textTransform: 'uppercase',

  },

  metrics: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    gap: Spacing.sm,

  },

});


