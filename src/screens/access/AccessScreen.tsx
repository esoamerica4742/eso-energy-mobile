import { useCallback } from 'react';
import {
  Platform,
  Pressable,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Activity, Wallet } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SpringEntrance } from '@/lib/motion/SpringEntrance';
import { SPRING_CARD } from '@/lib/motion/springMotion';
import { useCommandCenterNavigation } from '@/screens/access/useCommandCenterNavigation';
import type { AppProduct } from '@/lib/navigation/productRoutes';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HubCardProps = {
  title: string;
  body: string;
  accent: string;
  iconBg: string;
  Icon: typeof Activity;
  onPress: () => void;
};

function HubCard({ title, body, accent, iconBg, Icon, onPress }: HubCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96, SPRING_CARD);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_CARD);
      }}
      onPress={() => void onPress()}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-1"
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
    >
      <Animated.View
        style={animStyle}
        className="aspect-square rounded-2xl border border-[#242B3D] bg-[#0D1018] p-4"
      >
        <View className="absolute bottom-0 left-0 top-0 w-[3px] rounded-full" style={{ backgroundColor: accent }} />
        <View
          className="mb-4 h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={24} color={accent} />
        </View>
        <Text className="text-base font-bold text-white">{title}</Text>
        <Text className="mt-2 text-[13px] leading-[18px] text-[#6B7280]">{body}</Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

export default function AccessScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { navigateToProduct } = useCommandCenterNavigation();
  const compact = width <= 360;

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
    <View className="flex-1 bg-[#080A0F]">
      <StatusBar barStyle="light-content" backgroundColor="#080A0F" />
      <View
        className="pointer-events-none absolute left-0 right-0 self-center rounded-full bg-[#00C48C] opacity-[0.04]"
        style={{ top: insets.top + 40, width: 300, height: 180 }}
      />

      <View className="flex-1 px-5" style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }}>
        <SpringEntrance delay={0}>
          <View className="flex-row items-center px-1">
            <View className="h-px flex-1 bg-[#00C48C]/50" />
            <Text className="mx-3 text-[11px] font-bold tracking-[3.5px] text-[#00C48C]">
              ⚡ ESO ENERGY
            </Text>
            <View className="h-px flex-1 bg-[#00C48C]/50" />
          </View>
        </SpringEntrance>

        <SpringEntrance delay={80}>
          <Text
            className="mt-7 text-center font-extrabold text-white"
            style={{
              fontSize: compact ? 32 : 36,
              lineHeight: compact ? 40 : 44,
              fontFamily: Platform.OS === 'android' ? 'Inter_700Bold' : 'Inter_800ExtraBold',
            }}
          >
            Choose your{'\n'}command center
          </Text>
        </SpringEntrance>

        <SpringEntrance delay={160}>
          <View className="mt-8 flex-row gap-3">
            <HubCard
              title="ESO Inverter Monitoring"
              body="Fleet telemetry and alerts."
              accent="#00C48C"
              iconBg="#00C48C12"
              Icon={Activity}
              onPress={() => void openProduct('monitoring')}
            />
            <HubCard
              title="Eso Pay"
              body="Wallet and utility bills."
              accent="#C9A84C"
              iconBg="#C9A84C12"
              Icon={Wallet}
              onPress={() => void openProduct('esopay')}
            />
          </View>
        </SpringEntrance>
      </View>
    </View>
  );
}
