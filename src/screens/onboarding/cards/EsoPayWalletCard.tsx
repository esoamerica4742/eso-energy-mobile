import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Lightning, Wallet } from 'phosphor-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GlassCard } from '@/screens/onboarding/components/GlassCard';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

function UtilityChip({ label }: { label: string }) {
  return (
    <View
      className="rounded-full px-3 py-1.5"
      style={{
        backgroundColor: 'rgba(245,200,66,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(245,200,66,0.28)',
      }}
    >
      <Text style={{ color: C.gold, fontFamily: 'Inter_500Medium', fontSize: 11 }}>{label}</Text>
    </View>
  );
}

export function EsoPayWalletCard() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [shimmer]);

  const balanceGlow = useAnimatedStyle(() => ({
    opacity: 0.55 + shimmer.value * 0.35,
  }));

  return (
    <GlassCard>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(245,200,66,0.14)' }}
          >
            <Wallet size={18} color={C.gold} weight="fill" />
          </View>
          <Text
            className="text-[14px] tracking-[1.4px]"
            style={{ color: C.muted, fontFamily: 'Inter_600SemiBold' }}
          >
            ESO PAY WALLET
          </Text>
        </View>
        <View
          className="flex-row items-center gap-1 rounded-full px-2 py-1"
          style={{ backgroundColor: 'rgba(0,196,140,0.12)' }}
        >
          <Lightning size={12} color={C.green} weight="fill" />
          <Text style={{ color: C.green, fontFamily: 'Inter_500Medium', fontSize: 10 }}>LIVE</Text>
        </View>
      </View>

      <Animated.View style={[{ marginTop: 14 }, balanceGlow]}>
        <Text style={{ color: C.muted, fontFamily: 'Inter_400Regular', fontSize: 12 }}>
          Available balance
        </Text>
        <Text
          className="mt-1"
          style={{ color: C.text, fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -0.5 }}
        >
          ₦248,500
        </Text>
      </Animated.View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        <UtilityChip label="Electricity" />
        <UtilityChip label="Airtime" />
        <UtilityChip label="Data" />
        <UtilityChip label="Bills" />
      </View>

      <View
        className="mt-4 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <Text style={{ color: C.muted, fontFamily: 'Inter_400Regular', fontSize: 12 }}>
          Last payment
        </Text>
        <Text
          className="mt-1"
          style={{ color: C.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}
        >
          IKEDC prepaid · ₦15,000
        </Text>
      </View>
    </GlassCard>
  );
}
