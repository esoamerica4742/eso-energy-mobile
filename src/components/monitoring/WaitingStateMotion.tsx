import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { Colors } from '@/tokens/design';

const LISTEN_MS = 1500;
const FAULT_MS = 2000;
const PAUSED_MS = 2400;

type ShellProps = {
  children: ReactNode;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Slow opacity pulse — "actively listening" for awaiting telemetry copy. */
export function ListeningBlink({ children, active = true, style }: ShellProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!active || reduced) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.38, { duration: LISTEN_MS / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: LISTEN_MS / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [active, opacity, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!active || reduced) {
    return <View style={style}>{children}</View>;
  }

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

/** Amber border/shadow pulse — temporary paused state. */
export function PausedPulseShell({ children, active = true, style }: ShellProps) {
  const reduced = useReducedMotion();
  const glow = useSharedValue(0.35);

  useEffect(() => {
    if (!active || reduced) {
      glow.value = 0.35;
      return;
    }
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PAUSED_MS / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: PAUSED_MS / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [active, glow, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * 0.55,
    borderColor: `rgba(249,115,22,${0.28 + glow.value * 0.35})`,
  }));

  if (!active || reduced) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[styles.pulseShell, styles.pausedShell, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/** Red glow pulse — fault, critical, and open alerts. */
export function FaultPulseShell({ children, active = true, style }: ShellProps) {
  const reduced = useReducedMotion();
  const glow = useSharedValue(0.3);

  useEffect(() => {
    if (!active || reduced) {
      glow.value = 0.3;
      return;
    }
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: FAULT_MS / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: FAULT_MS / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [active, glow, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * 0.65,
    borderColor: `rgba(239,68,68,${0.32 + glow.value * 0.4})`,
  }));

  if (!active || reduced) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[styles.pulseShell, styles.faultShell, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/** Blinking amber dot beside stale sync timestamps. */
export function AmberSyncDot({
  active = true,
  color = Colors.warning,
}: {
  active?: boolean;
  color?: string;
}) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!active || reduced) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: LISTEN_MS / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: LISTEN_MS / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [active, opacity, reduced]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.syncDot,
        { backgroundColor: color },
        dotStyle,
        !active || reduced ? { opacity: active ? 1 : 0.35 } : null,
      ]}
    />
  );
}

export function badgePulseKind(label: string): 'paused' | 'fault' | 'critical' | 'none' {
  const normalized = label.trim().toUpperCase();
  if (normalized === 'PAUSED') return 'paused';
  if (normalized === 'FAULT') return 'fault';
  if (normalized === 'CRITICAL') return 'critical';
  return 'none';
}

export function PulseStatusBadge({
  label,
  accent,
  bg,
  border,
  textStyle,
  badgeStyle,
}: {
  label: string;
  accent: string;
  bg: string;
  border: string;
  textStyle: object;
  badgeStyle: object;
}) {
  const kind = badgePulseKind(label);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const isOffline = label.trim().toUpperCase() === 'OFFLINE';

  const closeTooltip = useCallback(() => setTooltipOpen(false), []);
  const openTooltip = useCallback(() => setTooltipOpen(true), []);

  const badge = (
    <View style={[badgeStyle, { borderColor: border, backgroundColor: bg }]}>
      <Text style={[textStyle, { color: accent }]}>{label}</Text>
    </View>
  );

  const wrappedBadge = isOffline ? (
    <View>
      <Pressable onPress={tooltipOpen ? closeTooltip : openTooltip} accessibilityRole="button">
        {badge}
      </Pressable>
      {tooltipOpen ? (
        <View style={styles.tooltipWrap} pointerEvents="box-none">
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>
              No connection detected. Data will sync when back online.
            </Text>
          </View>
          <Pressable style={styles.tooltipDismiss} onPress={closeTooltip} />
        </View>
      ) : null}
    </View>
  ) : (
    badge
  );

  if (kind === 'paused') {
    return <PausedPulseShell style={styles.badgeWrap}>{wrappedBadge}</PausedPulseShell>;
  }
  if (kind === 'fault' || kind === 'critical') {
    return <FaultPulseShell style={styles.badgeWrap}>{wrappedBadge}</FaultPulseShell>;
  }
  return wrappedBadge;
}

const styles = StyleSheet.create({
  pulseShell: {
    borderRadius: 100,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 4,
  },
  pausedShell: {
    shadowColor: Colors.warning,
    borderColor: Colors.warningBorder,
  },
  faultShell: {
    shadowColor: Colors.alert,
    borderColor: Colors.alertBorder,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
  },
  tooltipWrap: {
    position: 'absolute',
    top: '100%',
    right: 0,
    paddingTop: 8,
    zIndex: 50,
  },
  tooltipBubble: {
    maxWidth: 240,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tooltipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  tooltipDismiss: {
    ...StyleSheet.absoluteFill,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.warning,
    marginRight: 6,
  },
});
