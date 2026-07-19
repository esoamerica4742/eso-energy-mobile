import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ShieldCheck } from 'phosphor-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ESO_PAY_TEXT_PRIMARY } from '@/esopay/theme/brandColors';

const INACTIVE_SHIELD_COLOR = 'rgba(245, 240, 232, 0.35)';
const RING_GOLD = 'rgba(245, 240, 232, 0.45)';
const SONAR_DURATION = 2800;
const SONAR_HALF = SONAR_DURATION / 2;
const STAGGER_MS = 600;

const OUTER = 220;
const MIDDLE = 160;
const INNER = 100;
const ICON = 40;

const INACTIVE_RINGS = [
  { size: OUTER, baseOpacity: 0.03, delay: STAGGER_MS * 2 },
  { size: MIDDLE, baseOpacity: 0.05, delay: STAGGER_MS },
  { size: INNER, baseOpacity: 0.08, delay: 0 },
] as const;

type Props = {
  active: boolean;
};

const SonarRing = memo(function SonarRing({
  size,
  baseOpacity,
  delay,
  animate,
  reduceMotion,
}: {
  size: number;
  baseOpacity: number;
  delay: number;
  animate: boolean;
  reduceMotion: boolean;
}) {
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(baseOpacity);

  useEffect(() => {
    if (!animate || reduceMotion) {
      scale.value = 1;
      ringOpacity.value = baseOpacity;
      return;
    }

    const easing = Easing.inOut(Easing.ease);
    const timing = { duration: SONAR_HALF, easing };

    scale.value = withDelay(
      delay,
      withRepeat(withTiming(1.15, timing), -1, true),
    );
    ringOpacity.value = withDelay(
      delay,
      withRepeat(withTiming(0.02, timing), -1, true),
    );
  }, [animate, baseOpacity, delay, reduceMotion, ringOpacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    transform: [{ scale: scale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, ringStyle]}
    />
  );
});

export const PowerShieldOrb = memo(function PowerShieldOrb({ active }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [active, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = active ? ESO_PAY_TEXT_PRIMARY : INACTIVE_SHIELD_COLOR;

  return (
    <View style={styles.wrap}>
      {!active
        ? INACTIVE_RINGS.map((ring) => (
            <SonarRing
              key={ring.size}
              size={ring.size}
              baseOpacity={ring.baseOpacity}
              delay={ring.delay}
              animate
              reduceMotion={reduceMotion}
            />
          ))
        : null}

      <Animated.View style={[styles.pulseWrap, pulseStyle]}>
        {active ? (
          <>
            <View style={styles.outerActive} />
            <View style={styles.middleActive} />
          </>
        ) : null}
        <View style={[styles.inner, active && styles.innerActive]}>
          <ShieldCheck size={ICON} color={iconColor} weight="duotone" duotoneColor={iconColor} />
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: OUTER,
    height: OUTER,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseWrap: {
    width: OUTER,
    height: OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: RING_GOLD,
    backgroundColor: 'transparent',
  },
  outerActive: {
    position: 'absolute',
    width: OUTER,
    height: OUTER,
    borderRadius: OUTER / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'transparent',
  },
  middleActive: {
    position: 'absolute',
    width: MIDDLE,
    height: MIDDLE,
    borderRadius: MIDDLE / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'transparent',
  },
  inner: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerActive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
});

