import { useEffect } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Lightning, Phone, Television, WifiHigh, GraduationCap, Target, Drop, Recycle } from 'phosphor-react-native';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';

type Props = {
  slug: UtilityCategorySlug;
  color: string;
  size?: number;
};

function AnimatedBoltIcon({ color, size = 28 }: { color: string; size?: number }) {
  const flash = useSharedValue(1);
  useEffect(() => {
    flash.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 120, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 180, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, [flash]);
  const style = useAnimatedStyle(() => ({ opacity: flash.value }));
  return (
    <Animated.View style={style}>
      <Lightning size={size} color={color} weight="duotone" duotoneColor={color} />
    </Animated.View>
  );
}

function AnimatedSignalIcon({ color, size = 28 }: { color: string; size?: number }) {
  const bar1 = useSharedValue(0.4);
  const bar2 = useSharedValue(0.65);
  const bar3 = useSharedValue(1);
  useEffect(() => {
    const pulse = (sv: SharedValue<number>) => {
      sv.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    };
    pulse(bar1);
    const t2 = setTimeout(() => pulse(bar2), 120);
    const t3 = setTimeout(() => pulse(bar3), 240);
    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [bar1, bar2, bar3]);

  const s1 = useAnimatedStyle(() => ({ opacity: bar1.value, transform: [{ scaleY: bar1.value }] }));
  const s2 = useAnimatedStyle(() => ({ opacity: bar2.value, transform: [{ scaleY: bar2.value }] }));
  const s3 = useAnimatedStyle(() => ({ opacity: bar3.value, transform: [{ scaleY: bar3.value }] }));

  return (
    <View style={styles.signalRow}>
      <Animated.View style={[styles.signalBar, { backgroundColor: color }, s1]} />
      <Animated.View style={[styles.signalBar, { backgroundColor: color, height: 16 }, s2]} />
      <Animated.View style={[styles.signalBar, { backgroundColor: color, height: 22 }, s3]} />
    </View>
  );
}

export function BillPayCategoryIcon({ slug, color, size = 28 }: Props) {
  const props = { color, size };
  switch (slug) {
    case 'electricity':
      return <AnimatedBoltIcon {...props} />;
    case 'airtime':
      return <Phone {...props} weight="duotone" duotoneColor={color} />;
    case 'data':
      return <AnimatedSignalIcon {...props} />;
    case 'tv':
      return <Television {...props} weight="duotone" duotoneColor={color} />;
    case 'education':
      return <GraduationCap {...props} weight="duotone" duotoneColor={color} />;
    case 'betting':
      return <Target {...props} weight="duotone" duotoneColor={color} />;
    case 'water':
      return <Drop {...props} weight="duotone" duotoneColor={color} />;
    case 'waste':
      return <Recycle {...props} weight="duotone" duotoneColor={color} />;
    default:
      return <WifiHigh {...props} weight="duotone" duotoneColor={color} />;
  }
}

const styles = StyleSheet.create({
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
  },
  signalBar: {
    width: 4,
    height: 10,
    borderRadius: 2,
  },
});
