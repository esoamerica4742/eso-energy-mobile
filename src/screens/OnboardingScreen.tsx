import { useCallback, type ComponentType } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Lightning, Pulse, Wallet, type IconProps } from 'phosphor-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Defs, FeTurbulence, Filter, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SPRING_CARD,
  SPRING_PRIMARY,
  SPRING_SUBTLE,
} from '@/lib/motion/springMotion';
import { SpringEntrance } from '@/lib/motion/SpringEntrance';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import { ACCESS_ROUTE } from '@/lib/navigation/productRoutes';

import { inter } from '@/theme/fonts';

const BG = '#080A0F';
const SURFACE = '#0D1018';
const TEAL = '#00C48C';
const GOLD = '#C9A84C';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8A94A6';
const TEXT_MUTED = '#4A5568';
const BORDER_SUBTLE = '#1C2030';
const CARD_DESC = '#6B7280';

const ANDROID_NO_HYPHEN =
  Platform.OS === 'android' ? ({ android_hyphenationFrequency: 'none' as const } as const) : {};

const ENTRANCE = (delay: number) =>
  FadeInDown.delay(delay).duration(500).springify().damping(14);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 15, stiffness: 300 };

function NoiseOverlay() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter id="onboardingGrain">
            <FeTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </Filter>
        </Defs>
        <Rect width="100%" height="100%" filter="url(#onboardingGrain)" opacity={0.04} />
      </Svg>
    </View>
  );
}

function HeadlineGlow() {
  return <View style={styles.headlineGlow} pointerEvents="none" />;
}

function EsoEnergyWordmark() {
  return (
    <View style={styles.wordmarkRow}>
      <View style={styles.wordmarkLineLeft} />
      <Text style={styles.wordmarkText} {...ANDROID_NO_HYPHEN}>
        ⚡ ESO ENERGY
      </Text>
      <View style={styles.wordmarkLineRight} />
    </View>
  );
}

type ModuleVariant = 'monitoring' | 'esopay';

type ModuleCardProps = {
  icon: ComponentType<IconProps>;
  title: string;
  body: string;
  variant: ModuleVariant;
  paddingVertical: number;
};

function ModuleCard({ icon: Icon, title, body, variant, paddingVertical }: ModuleCardProps) {
  const accentColor = variant === 'monitoring' ? TEAL : GOLD;
  const iconBg = variant === 'monitoring' ? '#00C48C15' : '#C9A84C15';

  return (
    <View style={styles.moduleCard}>
      <View style={[styles.moduleAccent, { backgroundColor: accentColor }]} />
      <View style={[styles.moduleCardInner, { paddingVertical }]}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon size={22} color={accentColor} weight="regular" />
        </View>
        <Text style={styles.cardTitle} {...ANDROID_NO_HYPHEN}>
          {title}
        </Text>
        <Text style={styles.cardBody} {...ANDROID_NO_HYPHEN}>
          {body}
        </Text>
      </View>
    </View>
  );
}

function TrustFooter() {
  return (
    <Text style={styles.trustWrap} {...ANDROID_NO_HYPHEN}>
      <Text style={styles.trustSegment}>CBN-compliant</Text>
      <Text style={styles.trustDot}> · </Text>
      <Text style={styles.trustSegment}>PIN-protected</Text>
      <Text style={styles.trustDot}> · </Text>
      <Text style={styles.trustSegment}>Bank-grade encryption</Text>
    </Text>
  );
}

function GetStartedButton({ onPress }: { onPress: () => void }) {
  const reduceMotion = useReducedMotion() ?? false;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    if (reduceMotion) return;
    scale.value = withSpring(0.97, PRESS_SPRING);
    opacity.value = withSpring(0.85, PRESS_SPRING);
  }, [opacity, reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (reduceMotion) return;
    scale.value = withSpring(1, PRESS_SPRING);
    opacity.value = withSpring(1, PRESS_SPRING);
  }, [opacity, reduceMotion, scale]);

  const handlePress = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // device may not support haptics
    }
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => void handlePress()}
      accessibilityRole="button"
      accessibilityLabel="Get Started"
      style={styles.buttonPressable}
    >
      <Animated.View style={[styles.buttonOuter, animatedStyle]}>
        <Text style={styles.buttonText} {...ANDROID_NO_HYPHEN}>
          Get Started →
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const compactLayout = screenWidth <= 360 || screenHeight < 640;
  const headlineFontSize = screenWidth <= 360 ? 38 : 42;
  const headlineLineHeight = screenWidth <= 360 ? 45 : 50;
  const cardPaddingVertical = compactLayout ? 14 : 20;

  const finish = useCallback(async () => {
    await setOnboardingComplete();
    router.replace(ACCESS_ROUTE);
  }, [router]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <HeadlineGlow />
      <NoiseOverlay />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 20,
          },
        ]}
        scrollEnabled={compactLayout}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ENTRANCE(0)}>
          <EsoEnergyWordmark />
        </Animated.View>

        <Animated.View entering={ENTRANCE(80)}>
          <Text
            style={[
              styles.headline,
              { fontSize: headlineFontSize, lineHeight: headlineLineHeight },
            ]}
            {...ANDROID_NO_HYPHEN}
          >
            One Platform.{'\n'}Two Command Centers.
          </Text>
        </Animated.View>

        <Animated.View entering={ENTRANCE(160)}>
          <Text style={styles.subheadline} {...ANDROID_NO_HYPHEN}>
            Monitor inverter fleets. Pay utility bills.{'\n'}One app. One PIN per product.
          </Text>
        </Animated.View>

        <Animated.View entering={ENTRANCE(240)} style={styles.cardsRow}>
          <ModuleCard
            variant="monitoring"
            icon={Pulse}
            title="Monitoring"
            body="Fleet telemetry, alerts, and site intelligence"
            paddingVertical={cardPaddingVertical}
          />
          <ModuleCard
            variant="esopay"
            icon={Wallet}
            title="Eso Pay"
            body="Wallet, utilities, and bill settlements"
            paddingVertical={cardPaddingVertical}
          />
        </Animated.View>

        <Animated.View entering={ENTRANCE(320)}>
          <TrustFooter />
        </Animated.View>

        <Animated.View entering={ENTRANCE(400)} style={styles.buttonWrap}>
          <GetStartedButton onPress={() => void finish()} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  headlineGlow: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: 320,
    height: 200,
    borderRadius: 160,
    backgroundColor: TEAL,
    opacity: 0.04,
    zIndex: -1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  wordmarkLineLeft: {
    flex: 1,
    height: 1,
    backgroundColor: TEAL,
    opacity: 0.6,
    marginRight: 10,
  },
  wordmarkLineRight: {
    flex: 1,
    height: 1,
    backgroundColor: TEAL,
    opacity: 0.6,
    marginLeft: 10,
  },
  wordmarkText: {
    flexShrink: 0,
    color: TEAL,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.5,
    fontFamily: inter.bold,
  },
  headline: {
    fontFamily: 'Inter_800ExtraBold',
    fontWeight: Platform.OS === 'android' ? '900' : '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: 28,
    marginTop: 28,
  },
  subheadline: {
    fontFamily: inter.regular,
    fontSize: 15,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginTop: 14,
    alignSelf: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    alignItems: 'stretch',
  },
  moduleCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    overflow: 'hidden',
  },
  moduleAccent: {
    width: 3,
    borderRadius: 3,
    alignSelf: 'stretch',
  },
  moduleCardInner: {
    flex: 1,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  cardTitle: {
    fontFamily: inter.bold,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 14,
  },
  cardBody: {
    fontFamily: inter.regular,
    fontSize: 13,
    fontWeight: '400',
    color: CARD_DESC,
    marginTop: 4,
    lineHeight: 18,
  },
  trustWrap: {
    textAlign: 'center',
    marginTop: 20,
  },
  trustSegment: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    fontFamily: inter.medium,
  },
  trustDot: {
    color: TEXT_MUTED,
    fontFamily: inter.medium,
  },
  buttonWrap: {
    marginTop: 20,
  },
  buttonPressable: {
    width: '100%',
  },
  buttonOuter: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: inter.bold,
    fontSize: 16,
    fontWeight: '700',
    color: BG,
    textAlign: 'center',
  },
});
