/**
 * Device card — shows static device info + live telemetry + health score.
 * Memoized: only re-renders when the device row changes.
 */
import { memo, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Zap, Battery, Sun, Gauge, Activity, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useTelemetryStore, selectLatest } from '@/stores/telemetryStore';
import { calcHealthScore } from '@/services/supabase/devices';
import type { DbDevice } from '@/services/supabase/types';
import { colors, fontSize, fonts, radius, shadowCard, spacing } from '@/theme/tokens';

type Props = {
  device: DbDevice;
  onPress?: (id: string) => void;
};

const TYPE_ICON = {
  inverter:    Zap,
  battery:     Battery,
  solar_panel: Sun,
  generator:   Gauge,
  meter:       Activity,
};

const STATUS_CONFIG = {
  online:      { color: colors.positiveText, dot: colors.positiveText, label: 'Online'      },
  offline:     { color: colors.offlineText,  dot: colors.offlineDot,  label: 'Offline'     },
  fault:       { color: colors.offlineText,  dot: colors.offlineDot,  label: 'Fault'       },
  maintenance: { color: colors.warningText,  dot: colors.warningDot,  label: 'Maintenance' },
};

export const DeviceCard = memo(function DeviceCard({ device, onPress }: Props) {
  const telemetry = useTelemetryStore(selectLatest(device.id));
  const scale = useSharedValue(1);
  const faultPulse = useSharedValue(0);
  const iconSwing = useSharedValue(0);
  const faultDotPulse = useSharedValue(0);
  const bannerPulse = useSharedValue(0);
  const severityProgress = useSharedValue(0);
  const shimmerProgress = useSharedValue(0);
  const [severityTrackWidth, setSeverityTrackWidth] = useState(0);

  const health = calcHealthScore({
    status:       device.status,
    battery_pct:  telemetry?.battery_pct  ?? 80,
    temperature_c:telemetry?.temperature_c ?? 35,
    load_kw:      telemetry?.load_kw      ?? 0,
    rated_load_kw: (device.metadata as Record<string, number> | null)?.rated_load_kw,
  });

  const statusCfg = STATUS_CONFIG[device.status];
  const Icon = TYPE_ICON[device.type] ?? Zap;
  const isCriticalFault = device.type === 'generator' && device.status === 'fault';

  useEffect(() => {
    if (!isCriticalFault) return;
    faultPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    iconSwing.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    faultDotPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    bannerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    severityProgress.value = withTiming(1, { duration: 1200, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
    shimmerProgress.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [
    bannerPulse,
    faultDotPulse,
    faultPulse,
    iconSwing,
    isCriticalFault,
    severityProgress,
    shimmerProgress,
  ]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const faultCardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      faultPulse.value,
      [0, 0.5, 1],
      ['rgba(255,77,106,0.2)', 'rgba(255,77,106,0.5)', 'rgba(255,77,106,0.2)'],
    ),
  }));

  const iconSwingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(iconSwing.value, [0, 1], [-5, 5])}deg` }],
  }));

  const faultDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(faultDotPulse.value, [0, 1], [1, 1.6]) }],
    opacity: interpolate(faultDotPulse.value, [0, 1], [1, 0.2]),
  }));

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bannerPulse.value, [0, 1], [0.7, 1]),
  }));

  const severityFillStyle = useAnimatedStyle(() => ({
    width: severityTrackWidth * 0.85 * severityProgress.value,
  }));

  const severityShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerProgress.value, [0, 1], [-80, severityTrackWidth + 80]) }],
  }));

  const healthColor =
    health >= 80 ? colors.positiveText :
    health >= 50 ? colors.warningText :
                   colors.offlineText;

  const faultBattery = 87;
  const faultLoad = 0;
  const faultTemp = 98;
  const faultHealth = 15;

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.975, { damping: 18 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18 }); }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(device.id);
      }}
    >
      <Animated.View
        style={[
          styles.card,
          !isCriticalFault && shadowCard,
          animStyle,
          isCriticalFault && styles.faultCard,
          isCriticalFault && faultCardStyle,
        ]}
      >
        {isCriticalFault ? <View style={styles.faultGlow} /> : null}
        {/* Top row */}
        <View style={styles.topRow}>
          {isCriticalFault ? (
            <Animated.View style={[styles.faultIconWrap, iconSwingStyle]}>
              <Gauge size={28} color="#FF4D6A" strokeWidth={1.9} />
            </Animated.View>
          ) : (
            <View style={[styles.iconWrap, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
              <Icon size={18} color={colors.gold} strokeWidth={1.8} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={[styles.name, isCriticalFault && styles.faultName]} numberOfLines={1}>{device.name}</Text>
            <Text style={[styles.model, isCriticalFault && styles.faultModel]}>{device.model ?? device.type}</Text>
          </View>

          {isCriticalFault ? (
            <View style={styles.faultBadge}>
              <Animated.View style={[styles.dot, { backgroundColor: '#FF4D6A' }, faultDotStyle]} />
              <Text style={styles.faultBadgeText}>FAULT</Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <View style={[styles.dot, { backgroundColor: statusCfg.dot }]} />
              <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            </View>
          )}
        </View>

        {isCriticalFault ? (
          <Animated.View style={[styles.faultBanner, bannerStyle]}>
            <Text style={styles.faultBannerText}>⚠ Engine fault detected · Immediate inspection required</Text>
          </Animated.View>
        ) : null}

        {/* Metrics row */}
        {isCriticalFault ? (
          <View style={[styles.metrics, styles.faultMetrics]}>
            <MiniMetric label="Battery" value={`${faultBattery}%`} color={colors.positiveText} valueStyle={styles.faultMetricValue}>
              <View style={styles.batteryMiniBarTrack}>
                <View style={[styles.batteryMiniBarFill, { height: `${faultBattery}%` }]} />
              </View>
            </MiniMetric>
            <MiniMetric label="Load" value={`${faultLoad} kW`} color="rgba(255,255,255,0.3)" valueStyle={styles.faultMetricValueMuted} subLabel="Offline" subColor="rgba(255,77,106,0.7)" />
            <MiniMetric label="Temp" value={`${faultTemp}°C`} color="#FF4D6A" valueStyle={styles.faultMetricValue}>
              <Text style={styles.criticalSub}>Critical</Text>
            </MiniMetric>
            <MiniMetric label="Health" value={`${faultHealth}%`} color="#FF4D6A" valueStyle={styles.faultHealthValue}>
              <HealthArc percent={faultHealth} />
            </MiniMetric>
          </View>
        ) : (
          <View style={styles.metrics}>
            <MiniMetric
              label="Battery"
              value={telemetry ? `${Math.round(telemetry.battery_pct)}%` : '—'}
              color={
                (telemetry?.battery_pct ?? 80) > 60 ? colors.positiveText :
                (telemetry?.battery_pct ?? 80) > 25 ? colors.warningDot :
                                                       colors.offlineDot
              }
            />
            <MiniMetric
              label="Load"
              value={telemetry ? `${telemetry.load_kw.toFixed(1)} kW` : '—'}
              color={colors.gridText}
            />
            <MiniMetric
              label="Temp"
              value={telemetry ? `${Math.round(telemetry.temperature_c)}°C` : '—'}
              color={
                (telemetry?.temperature_c ?? 0) > 60 ? colors.offlineDot :
                (telemetry?.temperature_c ?? 0) > 48 ? colors.warningDot :
                                                        colors.textSecondary
              }
            />
            <MiniMetric
              label="Health"
              value={`${health}%`}
              color={healthColor}
            />
          </View>
        )}

        {/* Health bar */}
        {isCriticalFault ? (
          <View>
            <View style={styles.faultBarLabelRow}>
              <Text style={styles.faultBarLabel}>FAULT SEVERITY</Text>
              <Text style={styles.faultBarCritical}>CRITICAL</Text>
            </View>
            <View
              style={styles.faultTrack}
              onLayout={(e) => {
                setSeverityTrackWidth(e.nativeEvent.layout.width);
              }}
            >
              <Animated.View style={[styles.faultFillWrap, severityFillStyle]}>
                <LinearGradient
                  colors={['#FF8C42', '#FF4D6A']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.faultFill}
                />
                <Animated.View style={[styles.faultShimmer, severityShimmerStyle]} />
              </Animated.View>
            </View>
          </View>
        ) : (
          <View style={styles.healthBar}>
            <View style={[styles.healthFill, { width: `${health}%`, backgroundColor: healthColor }]} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

function MiniMetric({
  label,
  value,
  color,
  children,
  subLabel,
  subColor,
  valueStyle,
}: {
  label: string;
  value: string;
  color: string;
  children?: React.ReactNode;
  subLabel?: string;
  subColor?: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniLabel}>{label}</Text>
      <View style={styles.valueWrap}>
        <Text style={[styles.miniValue, { color }, valueStyle]}>{value}</Text>
        {children}
      </View>
      {subLabel ? <Text style={[styles.metricSub, subColor ? { color: subColor } : null]}>{subLabel}</Text> : null}
    </View>
  );
}

function HealthArc({ percent }: { percent: number }) {
  const size = 44;
  const stroke = 3;
  const radiusArc = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radiusArc;
  const dash = circumference * (percent / 100);
  return (
    <Svg width={size} height={size} style={styles.healthArc}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radiusArc}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radiusArc}
        stroke="#FF4D6A"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        rotation={-90}
        originX={size / 2}
        originY={size / 2}
        opacity={0.3}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  faultCard: {
    backgroundColor: '#0F1117',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,77,106,0.2)',
    shadowColor: '#FF4D6A',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 9,
    overflow: 'hidden',
  },
  faultGlow: {
    position: 'absolute',
    right: -45,
    top: -35,
    width: 170,
    height: 120,
    borderRadius: 100,
    backgroundColor: 'rgba(255,77,106,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 40, height: 40,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  faultIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,77,106,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#120D0F',
    shadowColor: '#FF4D6A',
    shadowOpacity: 0.32,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  info: { flex: 1 },
  name: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  model: {
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    marginTop: 2,
  },
  faultName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: -0.44,
    color: '#FFFFFF',
  },
  faultModel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 100,
  },
  faultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,77,106,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,106,0.35)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  faultBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.micro,
    color: '#FF4D6A',
    letterSpacing: 0.6,
  },
  faultBanner: {
    backgroundColor: 'rgba(255,77,106,0.08)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4D6A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  faultBannerText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,77,106,0.9)',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    letterSpacing: 0.3,
  },
  metrics: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  faultMetrics: {
    borderTopColor: 'rgba(255,77,106,0.08)',
  },
  miniMetric: { flex: 1, alignItems: 'center' },
  miniLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.08,
    marginBottom: 3,
  },
  valueWrap: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.body,
    fontVariant: ['tabular-nums'],
  },
  metricSub: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
  },
  faultMetricValue: {
    fontSize: 22,
    fontFamily: fonts.bold,
  },
  faultMetricValueMuted: {
    fontSize: 22,
    fontFamily: fonts.semibold,
  },
  faultHealthValue: {
    fontSize: 28,
    fontFamily: fonts.bold,
    textShadowColor: 'rgba(255,77,106,0.6)',
    textShadowRadius: 12,
  },
  criticalSub: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: '#FF4D6A',
  },
  batteryMiniBarTrack: {
    width: 4,
    height: 24,
    marginTop: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  batteryMiniBarFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    backgroundColor: colors.positiveText,
  },
  healthArc: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    opacity: 0.95,
  },
  healthBar: {
    height: 2,
    backgroundColor: colors.bgElevated,
    borderRadius: 1,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 1,
  },
  faultBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  faultBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.9,
  },
  faultBarCritical: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#FF4D6A',
    letterSpacing: 0.9,
  },
  faultTrack: {
    height: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  faultFillWrap: {
    height: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  faultFill: {
    ...StyleSheet.absoluteFill,
    shadowColor: '#FF4D6A',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  faultShimmer: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.45,
  },
});
