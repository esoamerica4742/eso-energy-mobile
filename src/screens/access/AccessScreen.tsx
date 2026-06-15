import { useCallback, type ComponentType } from 'react';
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CaretRight, Pulse, Wallet, type IconProps } from 'phosphor-react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppProduct } from '@/lib/navigation/productRoutes';
import {
  SPRING_CARD,
  SPRING_CARD_PRESS_IN,
  SPRING_CARD_PRESS_OUT,
  SPRING_PRIMARY,
  SPRING_SUBTLE,
} from '@/lib/motion/springMotion';
import { SpringEntrance } from '@/lib/motion/SpringEntrance';
import { useCommandCenterNavigation } from '@/screens/access/useCommandCenterNavigation';
import { inter } from '@/theme/fonts';

const BG = '#080A0F';
const SURFACE = '#0D1018';
const TEAL = '#00C48C';
const GOLD = '#C9A84C';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8A94A6';
const TEXT_MUTED = '#6B7280';
const BORDER_CARD = '#242B3D';

const MONITORING_ICON_BG = '#00C48C12';
const ESO_PAY_ICON_BG = '#C9A84C12';
const MONITORING_BORDER_ACTIVE = 'rgba(0, 196, 140, 0.19)';
const ESO_PAY_BORDER_ACTIVE = 'rgba(201, 168, 76, 0.19)';

const ANDROID_NO_HYPHEN =
  Platform.OS === 'android' ? ({ android_hyphenationFrequency: 'none' as const } as const) : {};

const CTA_PRESS_TIMING = { duration: 100 };
const BORDER_PRESS_SPRING = { stiffness: 300, damping: 20 };

function HeadlineGlow({ top }: { top: number }) {
  return (
    <View style={[styles.headlineGlowWrap, { top }]} pointerEvents="none">
      <View style={styles.headlineGlow} />
    </View>
  );
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

type ProductCardProps = {
  accentColor: string;
  activeBorderColor: string;
  iconBg: string;
  icon: ComponentType<IconProps>;
  iconColor: string;
  title: string;
  body: string;
  cta: string;
  ctaColor: string;
  onPress: () => void;
};

function ProductCard({
  accentColor,
  activeBorderColor,
  iconBg,
  icon: Icon,
  iconColor,
  title,
  body,
  cta,
  ctaColor,
  onPress,
}: ProductCardProps) {
  const scale = useSharedValue(1);
  const borderLift = useSharedValue(0);
  const ctaOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(borderLift.value, [0, 1], [BORDER_CARD, activeBorderColor]),
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, SPRING_CARD_PRESS_IN);
    borderLift.value = withSpring(1, BORDER_PRESS_SPRING);
    ctaOpacity.value = withTiming(0.6, CTA_PRESS_TIMING);
  }, [borderLift, ctaOpacity, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CARD_PRESS_OUT);
    borderLift.value = withSpring(0, BORDER_PRESS_SPRING);
    ctaOpacity.value = withTiming(1, CTA_PRESS_TIMING);
  }, [borderLift, ctaOpacity, scale]);

  const handlePress = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // device may not support haptics
    }
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => void handlePress()}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon size={22} color={iconColor} weight="regular" />
        </View>
        <Text style={styles.cardTitle} {...ANDROID_NO_HYPHEN}>
          {title}
        </Text>
        <Text style={styles.cardBody} {...ANDROID_NO_HYPHEN}>
          {body}
        </Text>
        <Animated.View style={[styles.ctaRow, ctaAnimatedStyle]}>
          <Text style={[styles.ctaText, { color: ctaColor }]} {...ANDROID_NO_HYPHEN}>
            {cta}
          </Text>
          <CaretRight size={15} color={ctaColor} weight="bold" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export default function AccessScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { navigateToProduct } = useCommandCenterNavigation();

  const firstCardMarginTop = screenWidth <= 360 ? 24 : 36;

  const openProduct = useCallback(
    (product: AppProduct) => {
      void navigateToProduct(product);
    },
    [navigateToProduct],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <HeadlineGlow top={insets.top + 40} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <SpringEntrance delay={0} offsetY={-10} scaleFrom={0.96} spring={SPRING_SUBTLE}>
          <View style={styles.wordmarkWrap}>
            <EsoEnergyWordmark />
          </View>
        </SpringEntrance>

        <SpringEntrance delay={80} offsetY={20} scaleFrom={0.92} spring={SPRING_PRIMARY}>
          <Text style={styles.headline} {...ANDROID_NO_HYPHEN}>
            Where do you want{'\n'}to go?
          </Text>
        </SpringEntrance>

        <SpringEntrance delay={160} offsetY={10} scaleFrom={0.96} spring={SPRING_SUBTLE}>
          <Text style={styles.subtitle} {...ANDROID_NO_HYPHEN}>
            Choose your command center.
          </Text>
        </SpringEntrance>

        <View style={[styles.cardsSection, { marginTop: firstCardMarginTop }]}>
          <SpringEntrance delay={260} offsetY={24} scaleFrom={0.93} spring={SPRING_CARD}>
            <ProductCard
              accentColor={TEAL}
              activeBorderColor={MONITORING_BORDER_ACTIVE}
              iconBg={MONITORING_ICON_BG}
              icon={Pulse}
              iconColor={TEAL}
              title="Inverter Monitoring"
              body="Fleet telemetry, alerts, and site intelligence."
              cta="Sign in to monitor"
              ctaColor={TEAL}
              onPress={() => openProduct('monitoring')}
            />
          </SpringEntrance>

          <SpringEntrance delay={360} offsetY={24} scaleFrom={0.93} spring={SPRING_CARD}>
            <ProductCard
              accentColor={GOLD}
              activeBorderColor={ESO_PAY_BORDER_ACTIVE}
              iconBg={ESO_PAY_ICON_BG}
              icon={Wallet}
              iconColor={GOLD}
              title="Eso Pay"
              body="Wallet, utility bills, and bank-grade settlements."
              cta="Sign in to pay"
              ctaColor={GOLD}
              onPress={() => openProduct('esopay')}
            />
          </SpringEntrance>
        </View>

        <SpringEntrance delay={460} offsetY={8} scaleFrom={0.97} spring={SPRING_SUBTLE}>
          <Text
            style={[styles.trustLine, { paddingBottom: insets.bottom + 20 }]}
            {...ANDROID_NO_HYPHEN}
          >
            Free to start · No card required
          </Text>
        </SpringEntrance>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  headlineGlowWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
    alignItems: 'center',
  },
  headlineGlow: {
    width: 300,
    height: 180,
    borderRadius: 150,
    backgroundColor: TEAL,
    opacity: 0.04,
  },
  content: {
    flex: 1,
  },
  wordmarkWrap: {
    marginTop: 16,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  wordmarkLineLeft: {
    flex: 1,
    height: 1,
    backgroundColor: TEAL,
    opacity: 0.5,
    marginRight: 10,
  },
  wordmarkLineRight: {
    flex: 1,
    height: 1,
    backgroundColor: TEAL,
    opacity: 0.5,
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
    fontSize: 38,
    lineHeight: 46,
    fontWeight: Platform.OS === 'android' ? '900' : '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: 10,
    marginTop: 28,
  },
  subtitle: {
    fontFamily: inter.regular,
    fontSize: 15,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 10,
  },
  cardsSection: {
    marginHorizontal: 20,
    gap: 14,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_CARD,
    paddingHorizontal: 20,
    paddingVertical: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  cardTitle: {
    fontFamily: inter.bold,
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  cardBody: {
    fontFamily: inter.regular,
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginTop: 6,
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
  },
  ctaText: {
    fontFamily: inter.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  trustLine: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: inter.medium,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: 24,
  },
});
