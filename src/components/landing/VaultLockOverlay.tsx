import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Lock } from 'lucide-react-native';
import { MotiView } from 'moti';

type Props = {
  unlocked: boolean;
};

import { METALLIC_GOLD } from '@/tokens/design';

const GOLD = METALLIC_GOLD;

export function VaultLockOverlay({ unlocked }: Props) {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!unlocked) return;
    const timer = setTimeout(() => setMounted(false), 450);
    return () => clearTimeout(timer);
  }, [unlocked]);

  if (!mounted) return null;

  return (
    <MotiView
      from={{ opacity: 1 }}
      animate={{ opacity: unlocked ? 0 : 1 }}
      transition={{ type: 'spring', duration: 400 }}
      pointerEvents={unlocked ? 'none' : 'auto'}
      style={StyleSheet.absoluteFill}
      className="overflow-hidden rounded-xl"
    >
      <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />
      <View className="absolute inset-0 bg-black/40" />

      <View className="flex-1 items-center justify-center px-8">
        <View
          className="mb-5 h-[72px] w-[72px] items-center justify-center rounded-full border"
          style={{ borderColor: `${GOLD}99` }}
        >
          <Lock size={28} color={GOLD} strokeWidth={1.75} />
        </View>
        <Text className="text-center font-mono text-[10px] uppercase leading-5 tracking-widest text-zinc-400">
          ENTERPRISE ACCESS ONLY — Tap &apos;Request Access&apos; to initiate architecture
          deployment.
        </Text>
      </View>
    </MotiView>
  );
}
