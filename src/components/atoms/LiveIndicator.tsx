import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { ConnectionStatus } from '@/hooks/useConnectionStatus';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

const CONFIG: Record<ConnectionStatus, { color: string; label: string }> = {
  live:         { color: colors.solarDot,  label: 'Live' },
  reconnecting: { color: colors.warningDot, label: 'Reconnecting' },
  offline:      { color: colors.offlineDot, label: 'Offline' },
};

export function LiveIndicator({ status }: { status: ConnectionStatus }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (status !== 'live') {
      opacity.value = withRepeat(
        withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
      );
    } else {
      opacity.value = 1;
    }
  }, [status, opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cfg = CONFIG[status];

  return (
    <Animated.View style={[styles.wrap, anim]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    letterSpacing: 0.3,
  },
});
