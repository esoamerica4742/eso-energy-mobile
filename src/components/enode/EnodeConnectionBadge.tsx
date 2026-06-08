import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import type { EnodeConnectionStatus } from '@/services/enode.types';
import { colors, fontSize, fonts } from '@/theme/tokens';

const CONFIG: Record<
  EnodeConnectionStatus,
  { color: string; label: string; pulse: boolean }
> = {
  connected: { color: colors.solarDot, label: 'Connected', pulse: false },
  syncing: { color: colors.warningDot, label: 'Syncing', pulse: true },
  error: { color: colors.offlineDot, label: 'Error', pulse: false },
  offline: { color: colors.textTertiary, label: 'Offline', pulse: false },
};

export function EnodeConnectionBadge({
  status,
}: {
  status: EnodeConnectionStatus;
}) {
  const cfg = CONFIG[status];
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (cfg.pulse) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
      );
    } else {
      opacity.value = 1;
    }
  }, [cfg.pulse, opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.wrap, anim]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={styles.label}>{cfg.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.badge,
    color: colors.textSecondary,
  },
});
