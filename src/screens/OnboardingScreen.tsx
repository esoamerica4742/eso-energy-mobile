import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOutUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import {
  MASTER_REGISTER_ROUTE,
  MASTER_SIGN_IN_ROUTE,
} from '@/lib/navigation/productRoutes';
import { inter } from '@/theme/fonts';

/** Dwell time per photo (excl. dissolve). */
const SLIDE_MS = 3800;
/** Revolut-like soft dissolve length. */
const DISSOLVE_MS = 900;
const KEN_MS = SLIDE_MS + DISSOLVE_MS;

const SLIDE_SOURCES = [
  require('../../assets/onboarding/slide-01-inverter.png'),
  require('../../assets/onboarding/slide-02-dashboard.png'),
  require('../../assets/onboarding/slide-03-meter.png'),
  require('../../assets/onboarding/slide-04-success.png'),
] as const;

const SLIDES = [
  {
    key: 'power',
    source: SLIDE_SOURCES[0],
    line: 'Power that pays for itself.',
  },
  {
    key: 'monitor',
    source: SLIDE_SOURCES[1],
    line: 'Monitor solar from your phone.',
  },
  {
    key: 'pay',
    source: SLIDE_SOURCES[2],
    line: 'Pay electricity & bills in seconds.',
  },
  {
    key: 'success',
    source: SLIDE_SOURCES[3],
    line: 'Airtime, data, and more.',
  },
] as const;

const LINE_SLOT_HEIGHT = 68;
const PRESS_SPRING = { stiffness: 380, damping: 24, mass: 0.85 };
const LUXURY_EASE = Easing.bezier(0.22, 1, 0.36, 1);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PillButton({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      style={[
        styles.pill,
        variant === 'primary' ? styles.pillPrimary : styles.pillSecondary,
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.pillText,
          variant === 'primary' ? styles.pillTextPrimary : styles.pillTextSecondary,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

/** Full-bleed photo with luxury Ken Burns — never unmounts while active/base. */
function PhotoLayer({
  source,
  visible,
  isTop,
  onLoad,
}: {
  source: number;
  visible: boolean;
  isTop: boolean;
  onLoad?: () => void;
}) {
  const opacity = useSharedValue(visible ? 1 : 0);
  const ken = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: DISSOLVE_MS,
      easing: LUXURY_EASE,
    });
    if (visible) {
      ken.value = 0;
      ken.value = withTiming(1, {
        duration: KEN_MS,
        easing: Easing.linear,
      });
    }
  }, [ken, opacity, visible]);

  const style = useAnimatedStyle(() => {
    const scale = interpolate(ken.value, [0, 1], [1.0, 1.055]);
    const ty = interpolate(ken.value, [0, 1], [0, -10]);
    return {
      opacity: opacity.value,
      transform: [{ scale }, { translateY: ty }],
      zIndex: isTop ? 2 : 1,
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Image
        source={source}
        style={styles.photo}
        resizeMode="cover"
        fadeDuration={0}
        onLoad={onLoad}
        onError={onLoad}
      />
    </Animated.View>
  );
}

/**
 * Welcome landing — full-bleed photos, soft dissolves,
 * Ken Burns, and a fixed CTA dock that never jumps with copy changes.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  /** Dual buffers so we never remount both images at once. */
  const [slotA, setSlotA] = useState(0);
  const [slotB, setSlotB] = useState(0);
  const [topIsB, setTopIsB] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [firstPaint, setFirstPaint] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await Asset.loadAsync([...SLIDE_SOURCES]);
      } catch {
        // Image require() still works.
      }
      if (!cancelled) setAssetsReady(true);
    })();
    const fallback = setTimeout(() => {
      if (!cancelled) setFirstPaint(true);
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => {
      const next = (i + 1) % SLIDES.length;
      // Incoming goes into the hidden slot, then becomes top.
      if (topIsB) {
        setSlotA(next);
        setTopIsB(false);
      } else {
        setSlotB(next);
        setTopIsB(true);
      }
      return next;
    });
  }, [topIsB]);

  useEffect(() => {
    if (!assetsReady || !firstPaint) return;

    const timer = setTimeout(() => {
      advance();
    }, SLIDE_MS);

    return () => clearTimeout(timer);
  }, [advance, assetsReady, firstPaint, index]);

  const openRegister = useCallback(async () => {
    await setOnboardingComplete();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(MASTER_REGISTER_ROUTE);
  }, [router]);

  const openSignIn = useCallback(async () => {
    await setOnboardingComplete();
    void Haptics.selectionAsync();
    router.push(MASTER_SIGN_IN_ROUTE);
  }, [router]);

  const line = SLIDES[index]?.line ?? SLIDES[0].line;
  const bottomPad = Math.max(insets.bottom, 12) + 16;
  const topPad = Math.max(insets.top, 12);

  // Bottom (underlay) stays opaque; top dissolves in — never a blank frame.
  const underIndex = topIsB ? slotA : slotB;
  const overIndex = topIsB ? slotB : slotA;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <PhotoLayer
          source={SLIDES[underIndex].source}
          visible
          isTop={false}
          onLoad={!firstPaint ? () => setFirstPaint(true) : undefined}
        />
        <PhotoLayer
          source={SLIDES[overIndex].source}
          visible={topIsB ? overIndex === slotB : overIndex === slotA}
          isTop
        />
        {/* Soft cinematic vignette — Revolut depth */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.35)',
            'rgba(0,0,0,0.08)',
            'rgba(0,0,0,0.28)',
            'rgba(0,0,0,0.78)',
            '#000000',
          ]}
          locations={[0, 0.28, 0.55, 0.78, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={[styles.topChrome, { paddingTop: topPad + 20 }]} pointerEvents="none">
        <Animated.Text entering={FadeIn.duration(700).delay(120)} style={styles.brand}>
          Eso Energy
        </Animated.Text>
      </View>

      <View style={[styles.dock, { paddingBottom: bottomPad }]} pointerEvents="box-none">
        <View style={styles.copyBlock} pointerEvents="none">
          <View style={styles.lineSlot}>
            <Animated.Text
              key={SLIDES[index].key}
              entering={FadeInDown.duration(520).easing(LUXURY_EASE)}
              exiting={FadeOutUp.duration(280).easing(Easing.in(Easing.cubic))}
              style={styles.line}
              numberOfLines={2}
            >
              {line}
            </Animated.Text>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(180).easing(LUXURY_EASE)}
          style={styles.ctaBlock}
        >
          <PillButton
            label="Create account"
            variant="primary"
            onPress={() => void openRegister()}
          />
          <PillButton
            label="Log in"
            variant="secondary"
            onPress={() => void openSignIn()}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  topChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brand: {
    fontFamily: inter.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    zIndex: 6,
  },
  copyBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  lineSlot: {
    minHeight: LINE_SLOT_HEIGHT,
    maxHeight: LINE_SLOT_HEIGHT,
    width: '100%',
    maxWidth: 340,
    justifyContent: 'flex-end',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  line: {
    fontFamily: inter.semibold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  ctaBlock: {
    width: '100%',
    gap: 12,
  },
  pill: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillPrimary: {
    backgroundColor: '#FFFFFF',
  },
  pillSecondary: {
    backgroundColor: 'rgba(44,44,46,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillText: {
    fontFamily: inter.semibold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  pillTextPrimary: {
    color: '#000000',
  },
  pillTextSecondary: {
    color: '#FFFFFF',
  },
});
