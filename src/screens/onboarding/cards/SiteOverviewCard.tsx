import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GlassCard } from '@/screens/onboarding/components/GlassCard';
import { MetricRow } from '@/screens/onboarding/components/MetricRow';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

export function SiteOverviewCard() {
  const live = useSharedValue(0);
  useEffect(() => {
    live.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [live]);

  const liveDot = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + live.value * 0.4 }],
    opacity: 0.7 + live.value * 0.3,
  }));

  const shake = useSharedValue(0);
  useEffect(() => {
    shake.value = withRepeat(
      withSequence(
        withDelay(4000, withTiming(1, { duration: 60 })),
        withTiming(-1, { duration: 60 }),
        withTiming(1, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      ),
      -1,
      false,
    );
  }, [shake]);

  const degradedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value * 2 }],
  }));

  return (
    <GlassCard>
      <View className="flex-row items-center justify-between">
        <Text
          className="text-[14px] tracking-[1.6px]"
          style={{ color: C.muted, fontFamily: 'Inter_600SemiBold' }}
        >
          SITE OVERVIEW
        </Text>
        <View className="flex-row items-center gap-2">
          <Animated.View
            style={[{ width: 8, height: 8, borderRadius: 999, backgroundColor: C.green }, liveDot]}
          />
          <Text
            className="text-[12px] tracking-[1.4px]"
            style={{ color: C.green, fontFamily: 'Inter_600SemiBold' }}
          >
            LIVE
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <MetricRow label="AC Output" value="142 kW" color={C.gold} fill={0.72} delayMs={250} />
        <MetricRow label="Battery SOC" value="87%" color={C.green} fill={0.87} delayMs={350} />
        <MetricRow label="Grid Voltage" value="230 V" color={C.blue} fill={0.92} delayMs={450} />
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {['INV-001 ● Healthy', 'TRF-004 ● Healthy'].map((label) => (
          <View
            key={label}
            className="rounded-full px-4 py-2"
            style={{ borderColor: 'rgba(0,196,140,0.35)', borderWidth: 1 }}
          >
            <Text className="text-[14px]" style={{ color: C.text, fontFamily: 'Inter_500Medium' }}>
              {label}
            </Text>
          </View>
        ))}
        <Animated.View style={degradedStyle}>
          <View
            className="rounded-full px-4 py-2"
            style={{ borderColor: 'rgba(245,200,66,0.35)', borderWidth: 1 }}
          >
            <Text className="text-[14px]" style={{ color: C.text, fontFamily: 'Inter_500Medium' }}>
              BAT-012 ● Degraded
            </Text>
          </View>
        </Animated.View>
      </View>
    </GlassCard>
  );
}
