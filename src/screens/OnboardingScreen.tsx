import { useCallback } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setOnboardingComplete } from '@/lib/onboardingStorage';
import {
  MASTER_REGISTER_ROUTE,
  MASTER_SIGN_IN_ROUTE,
} from '@/lib/navigation/productRoutes';

const ENTRANCE = (delay: number) =>
  FadeInDown.delay(delay).duration(500).springify().damping(14);

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const headlineSize = screenWidth <= 360 ? 34 : 38;

  const openSignIn = useCallback(async () => {
    await setOnboardingComplete();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(MASTER_SIGN_IN_ROUTE);
  }, [router]);

  const openRegister = useCallback(async () => {
    await setOnboardingComplete();
    void Haptics.selectionAsync();
    router.push(MASTER_REGISTER_ROUTE);
  }, [router]);

  return (
    <View className="flex-1 bg-[#080A0F]">
      <StatusBar barStyle="light-content" backgroundColor="#080A0F" />
      <View
        className="pointer-events-none absolute left-0 right-0 top-20 self-center h-48 w-80 rounded-full bg-[#00C48C] opacity-[0.04]"
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 24,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ENTRANCE(0)} className="mb-8 flex-row items-center justify-center">
          <View className="h-px flex-1 bg-[#00C48C]/50" />
          <View className="mx-3 flex-row items-center gap-1.5">
            <Zap size={14} color="#00C48C" />
            <Text className="text-[11px] font-bold tracking-[3.5px] text-[#00C48C]">
              ESO ENERGY
            </Text>
          </View>
          <View className="h-px flex-1 bg-[#00C48C]/50" />
        </Animated.View>

        <Animated.View entering={ENTRANCE(80)}>
          <Text
            className="text-center font-extrabold text-white"
            style={{
              fontSize: headlineSize,
              lineHeight: headlineSize + 8,
              letterSpacing: -0.5,
              fontFamily: Platform.OS === 'android' ? 'Inter_700Bold' : 'Inter_800ExtraBold',
            }}
          >
            One Platform.{'\n'}Two Command Centers.
          </Text>
        </Animated.View>

        <Animated.View entering={ENTRANCE(160)}>
          <Text className="mx-auto mt-4 max-w-[300px] text-center text-[15px] leading-6 text-[#8A94A6]">
            Monitor inverter fleets. Pay utility bills.{'\n'}One app. One secure account.
          </Text>
        </Animated.View>

        <Animated.View entering={ENTRANCE(240)} className="mt-10">
          <Pressable
            onPress={() => void openSignIn()}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
            className="rounded-2xl bg-[#C9A84C] px-6 py-4 shadow-lg"
          >
            <Text className="text-center text-base font-bold text-[#080A0F]">Sign In</Text>
          </Pressable>

          <Pressable
            onPress={() => void openRegister()}
            accessibilityRole="button"
            accessibilityLabel="Create an Account"
            className="mt-5 py-2"
          >
            <Text className="text-center text-base font-bold text-white underline decoration-white/40">
              Create an Account
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={ENTRANCE(320)}>
          <Text className="mt-8 text-center text-xs text-[#4A5568]">
            Secure Access · PIN-protected · Bank-grade encryption
          </Text>
          <Text className="mt-2 text-center text-[11px] text-[#4A5568]">
            Eso Energy Tech Limited
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
