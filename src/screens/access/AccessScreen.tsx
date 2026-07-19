import { useCallback } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Activity, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SpringEntrance } from '@/lib/motion/SpringEntrance';
import { useCommandCenterNavigation } from '@/screens/access/useCommandCenterNavigation';
import type { AppProduct } from '@/lib/navigation/productRoutes';
import { inter } from '@/theme/fonts';

const BG = '#000000';
const SURFACE = '#1C1C1E';
const TEXT = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.55)';
const PRESS_SPRING = { stiffness: 320, damping: 22 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ProductCard({
  title,
  body,
  Icon,
  onPress,
}: {
  title: string;
  body: string;
  Icon: typeof Activity;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
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
      style={[styles.card, style]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.cardIcon}>
        <Icon size={22} color={TEXT} strokeWidth={2} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </AnimatedPressable>
  );
}

export default function AccessScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { navigateToProduct } = useCommandCenterNavigation();
  const stackCards = width <= 360;

  const openProduct = useCallback(
    async (product: AppProduct) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
      void navigateToProduct(product);
    },
    [navigateToProduct],
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 16) + 24,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          },
        ]}
      >
        <SpringEntrance delay={40}>
          <Text style={styles.brand}>ESO ENERGY</Text>
        </SpringEntrance>

        <SpringEntrance delay={100}>
          <Text style={styles.headline}>Where to?</Text>
        </SpringEntrance>

        <SpringEntrance delay={160}>
          <Text style={styles.lead}>Pick a product. Switch anytime in Settings.</Text>
        </SpringEntrance>

        <SpringEntrance delay={220}>
          <View style={[styles.cards, stackCards && styles.cardsStack]}>
            <ProductCard
              title="Monitoring"
              body="Fleet telemetry and site intelligence"
              Icon={Activity}
              onPress={() => void openProduct('monitoring')}
            />
            <ProductCard
              title="Eso Pay"
              body="Wallet, utilities, and bill payments"
              Icon={Wallet}
              onPress={() => void openProduct('esopay')}
            />
          </View>
        </SpringEntrance>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  brand: {
    fontFamily: inter.bold,
    fontSize: 12,
    letterSpacing: 3.2,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 20,
  },
  headline: {
    fontFamily: inter.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    color: TEXT,
    textAlign: 'center',
    marginBottom: 10,
  },
  lead: {
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 32,
  },
  cards: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  cardsStack: {
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 22,
    minHeight: 168,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontFamily: inter.bold,
    fontSize: 18,
    lineHeight: 24,
    color: TEXT,
    marginBottom: 6,
  },
  cardBody: {
    fontFamily: inter.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
});
