import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PayBills, PayBillsFonts } from '@/esopay/auth/payBillsTheme';

function LoadingDots() {
  const dots = [
    useRef(new Animated.Value(0.35)).current,
    useRef(new Animated.Value(0.35)).current,
    useRef(new Animated.Value(0.35)).current,
  ];

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
      <LinearGradient
        colors={[PayBills.gold1, PayBills.gold2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? <LoadingDots /> : <Text style={styles.label}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: PayBills.gold2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 6,
  },
  wrapDisabled: {
    opacity: 0.35,
    shadowOpacity: 0,
  },
  wrapPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.95,
  },
  gradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: PayBillsFonts.sora,
    fontSize: 15,
    color: PayBills.btnText,
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
    backgroundColor: PayBills.btnText,
  },
});
