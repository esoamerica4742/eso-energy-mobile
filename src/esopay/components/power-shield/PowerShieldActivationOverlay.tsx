import { memo, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Shield } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';

type Props = {
  onActivate: () => void;
  activating?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BreathingShield() {
  const glow = useSharedValue(0.35);
  const scale = useSharedValue(1);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glow, scale]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.shieldWrap}>
      <Animated.View style={[styles.shieldGlow, glowStyle]} />
      <View style={styles.shieldIcon}>
        <Shield size={36} color={PS.gold} strokeWidth={2} fill={`${PS.gold}22`} />
      </View>
    </View>
  );
}

export const PowerShieldActivationOverlay = memo(function PowerShieldActivationOverlay({
  onActivate,
  activating = false,
}: Props) {
  const pressScale = useSharedValue(1);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, { duration: 100, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  const handleActivate = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onActivate();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {Platform.OS === 'web' ? (
        <View style={[StyleSheet.absoluteFill, styles.webBlur]} />
      ) : (
        <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.scrim} />

      <View style={styles.content}>
        <BreathingShield />
        <Text style={styles.title}>Power Shield</Text>
        <Text style={styles.subtitle}>
          Nigeria&apos;s first prepaid electricity blackout guard. We warn you before your token runs out.
        </Text>

        <AnimatedPressable
          onPress={handleActivate}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={activating}
          style={[styles.cta, btnStyle, activating && styles.ctaDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Activate Power Shield"
        >
          <Text style={styles.ctaText}>{activating ? 'Activating…' : 'Activate Power Shield'}</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  webBlur: {
    backgroundColor: 'rgba(13, 17, 23, 0.72)',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 17, 23, 0.55)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  shieldWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shieldGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PS.goldGlow,
  },
  shieldIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${PS.gold}55`,
    backgroundColor: 'rgba(240, 165, 0, 0.08)',
  },
  title: {
    fontFamily: psFont.bold,
    fontWeight: '700',
    fontSize: 24,
    color: PS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: psFont.regular,
    fontSize: 14,
    lineHeight: 21,
    color: PS.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  cta: {
    marginTop: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: PS.gold,
    minWidth: 240,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontFamily: psFont.bold,
    fontWeight: '700',
    fontSize: 15,
    color: '#1A1200',
  },
});
