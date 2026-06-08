import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { FaultPulseShell } from '@/components/monitoring/WaitingStateMotion';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { BatteryData } from '@/types/dashboard';

const MIN_FILL = 4;
const TRACK_HEIGHT = 8;

function fillColor(soc: number) {
  if (soc <= 0) return Colors.textMuted;
  if (soc <= 10) return Colors.alert;
  if (soc <= 20) return Colors.warning;
  return Colors.battery;
}

function isCriticallyLow(soc: number, statusLabel: string) {
  if (soc > 0 && soc <= 15) return true;
  return statusLabel.trim().toUpperCase() === 'CRITICAL';
}

type Props = {
  battery: BatteryData;
};

export function BatteryBar({ battery }: Props) {
  const displaySoc = Math.max(battery.soc, MIN_FILL);
  const barColor = fillColor(battery.soc);
  const criticallyLow = isCriticallyLow(battery.soc, battery.statusLabel);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const socLabel =
    battery.soc > 0 ? `${battery.soc}%` : '—';
  const socColor = pendingMetricColor(socLabel, barColor) ?? barColor;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: displaySoc,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [displaySoc, fillAnim]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const fillBar = (
    <Animated.View style={[styles.fill, { width: fillWidth, backgroundColor: barColor }]} />
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>RESERVE LEVEL</Text>
        <Text style={[styles.soc, { color: socColor }]}>
          {socLabel} · {battery.statusLabel.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.reserveName}>{battery.label}</Text>
      <View style={styles.track}>
        {criticallyLow ? (
          <FaultPulseShell active style={styles.fillPulse}>
            {fillBar}
          </FaultPulseShell>
        ) : (
          fillBar
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  soc: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    fontVariant: ['tabular-nums'],
  },
  reserveName: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: Colors.surfaceRaised,
    overflow: 'hidden',
  },
  fillPulse: {
    height: '100%',
    width: '100%',
    borderWidth: 0,
    borderRadius: TRACK_HEIGHT / 2,
    shadowRadius: 10,
  },
  fill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
});
