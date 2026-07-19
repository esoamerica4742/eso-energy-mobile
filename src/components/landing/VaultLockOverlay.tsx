import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Lock } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { METALLIC_GOLD } from '@/tokens/design';

type Props = {
  unlocked: boolean;
};

const GOLD = METALLIC_GOLD;

export function VaultLockOverlay({ unlocked }: Props) {
  const opacity = useSharedValue(unlocked ? 0 : 1);

  useEffect(() => {
    opacity.value = withTiming(unlocked ? 0 : 1, { duration: 400 });
  }, [unlocked, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={unlocked ? 'none' : 'auto'}
      style={[StyleSheet.absoluteFill, animStyle, styles.root]}
    >
      <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.dim} />

      <View style={styles.content}>
        <View style={styles.lockRing}>
          <Lock size={28} color={GOLD} strokeWidth={1.75} />
        </View>
        <Text style={styles.copy}>
          ENTERPRISE ACCESS ONLY — Tap &apos;Request Access&apos; to initiate architecture
          deployment.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  lockRing: {
    marginBottom: 20,
    height: 72,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: `${GOLD}99`,
  },
  copy: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 20,
    letterSpacing: 2,
    color: '#A1A1AA',
  },
});
