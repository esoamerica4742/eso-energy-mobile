import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PS } from '@/esopay/components/power-shield/powerShieldTheme';

/** Single flicker on mount — micro-interaction accent. */
export const PowerShieldLightningBolt = memo(function PowerShieldLightningBolt() {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) }),
      withTiming(0.25, { duration: 120, easing: Easing.in(Easing.quad) }),
      withTiming(0.85, { duration: 60 }),
      withTiming(0.4, { duration: 200, easing: Easing.out(Easing.cubic) }),
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.wrap, style]}>
      <Zap size={18} color={PS.gold} strokeWidth={2.4} fill={`${PS.gold}33`} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
