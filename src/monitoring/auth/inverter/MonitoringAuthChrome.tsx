import { type ReactNode, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { inter } from '@/theme/fonts';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import { INVERTER_AUTH, PRESS_SPRING, tealGlowStyle } from '@/monitoring/auth/inverter/tokens';

const SEGMENT_COUNT = 4;
const SEGMENT_GAP = 6;

type HeaderProps = {
  step: number;
  onBack?: () => void;
};

export function MonitoringAuthHeader({ step, onBack }: HeaderProps) {
  return (
    <View style={styles.headerRow}>
      {onBack ? (
        <AuthPressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={INVERTER_AUTH.TEAL} />
        </AuthPressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <Text style={styles.stepText}>
        {step} of {SEGMENT_COUNT}
      </Text>
    </View>
  );
}

export function MonitoringProgressBar({ filledSegments }: { filledSegments: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: SEGMENT_COUNT }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressSegment,
            {
              backgroundColor:
                index < filledSegments ? INVERTER_AUTH.TEAL : INVERTER_AUTH.BORDER_DEFAULT,
            },
          ]}
        />
      ))}
    </View>
  );
}

type PulseIconProps = {
  children: ReactNode;
  size?: number;
};

export function TealPulseIcon({ children, size = 64 }: PulseIconProps) {
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [opacity, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: opacity.value,
  }));

  const half = size / 2;

  return (
    <View style={[styles.pulseWrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.pulseGlow,
          tealGlowStyle(),
          { width: size, height: size, borderRadius: half },
          glowStyle,
        ]}
      />
      <View
        style={[
          styles.pulseIconRing,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderColor: INVERTER_AUTH.TEAL,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** When true, button uses teal active styling (animated 200ms). */
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function MonitoringTealButton({
  label,
  onPress,
  active = true,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const activeProgress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withTiming(active && !disabled && !loading ? 1 : 0, {
      duration: 200,
      easing: Easing.ease,
    });
  }, [active, activeProgress, disabled, loading]);

  const buttonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      [INVERTER_AUTH.BG_ELEVATED, INVERTER_AUTH.TEAL],
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeProgress.value,
      [0, 1],
      [INVERTER_AUTH.TEXT_DISABLED, INVERTER_AUTH.BUTTON_TEXT],
    ),
  }));

  const isPressable = active && !disabled && !loading;

  return (
    <AuthPressable
      onPress={onPress}
      disabled={!isPressable}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isPressable }}
    >
      <Animated.View style={[styles.button, buttonStyle]}>
        <Animated.Text style={[styles.buttonText, textStyle]}>{label}</Animated.Text>
      </Animated.View>
    </AuthPressable>
  );
}

export function MonitoringModuleBadge() {
  return (
    <View style={styles.moduleBadge}>
      <Text style={styles.moduleBadgeText}>
        <Text style={styles.lightning}>⚡ </Text>
        Eso Inverter Monitoring
      </Text>
    </View>
  );
}

export function MonitoringScreenShell({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: INVERTER_AUTH.BG_PRIMARY,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerSpacer: {
    width: 22,
  },
  stepText: {
    color: INVERTER_AUTH.TEAL,
    fontFamily: inter.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    gap: SEGMENT_GAP,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  pulseWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  pulseGlow: {
    position: 'absolute',
    backgroundColor: INVERTER_AUTH.TEAL_GLOW,
  },
  pulseIconRing: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    height: 56,
    borderRadius: INVERTER_AUTH.INPUT_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: inter.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  moduleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: INVERTER_AUTH.TEAL,
    backgroundColor: INVERTER_AUTH.TEAL_GLOW,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  moduleBadgeText: {
    color: INVERTER_AUTH.TEAL,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  lightning: {
    color: INVERTER_AUTH.GOLD,
  },
});
