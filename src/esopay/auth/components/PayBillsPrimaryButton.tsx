import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ds } from '@/esopay/theme/designSystem';
import { inter } from '@/theme/fonts';

function LoadingDots() {
  const dotsRef = useRef([
    new Animated.Value(0.35),
    new Animated.Value(0.35),
    new Animated.Value(0.35),
  ]);
  const dots = dotsRef.current;

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.35, duration: 300, useNativeDriver: true }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={styles.dots}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
      ))}
    </View>
  );
}

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PayBillsPrimaryButton({ label, onPress, loading = false, disabled = false }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.wrap,
        isDisabled && styles.wrapDisabled,
        pressed && !isDisabled && styles.wrapPressed,
      ]}
    >
      <View style={styles.inner}>
        {loading ? <LoadingDots /> : <Text style={styles.label}>{label}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: ds.radius.input,
    overflow: 'hidden',
    backgroundColor: ds.color.gold,
  },
  wrapDisabled: {
    opacity: 0.45,
  },
  wrapPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  inner: {
    height: ds.size.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: inter.semibold,
    fontSize: ds.type.button.fontSize,
    color: '#FFFFFF',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
