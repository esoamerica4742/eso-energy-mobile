import { View, Text } from 'react-native';

export function LandingHero() {
  return (
    <View className="px-5 pb-6 pt-6">
      <Text className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37]">
        THE SOVEREIGN INFRASTRUCTURE
      </Text>
      <Text
        className="mt-3 font-semibold text-[42px] leading-[46px] tracking-tighter text-white"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        ESO ENERGY
      </Text>
      <Text className="mt-4 text-sm leading-relaxed text-zinc-400">
        Africa&apos;s Premier B2B Architecture for Hybrid Solar-Grid Orchestration, Fuel Security,
        and Real-Time Asset Intelligence.
      </Text>
    </View>
  );
}
