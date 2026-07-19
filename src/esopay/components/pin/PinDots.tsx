import { memo, useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  type AnimatedStyle,
} from 'react-native-reanimated';
import {
  SPRING_DOT_CLEAR,
  SPRING_DOT_POP,
  SPRING_DOT_SETTLE,
} from '@/lib/motion/springMotion';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import { ESO_PAY_GOLD } from '@/esopay/theme/brandColors';

const GOLD = ESO_PAY_GOLD;

type PinDotsVariant = 'default' | 'welcomeBack' | 'quiet';

type Props = {
  filledCount: number;
  length?: number;
  animateFill?: boolean;
  shakeStyle?: AnimatedStyle<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  variant?: PinDotsVariant;
};

const PinDot = memo(function PinDot({
  filled,
  reduceMotion,
  animateFill,
  variant,
}: {
  filled: boolean;
  reduceMotion: boolean;
  animateFill: boolean;
  variant: PinDotsVariant;
}) {
  const dotAnim = useSharedValue(filled ? 1 : 0);
  const wasFilled = useRef(filled);

  useEffect(() => {
    const justFilled = filled && !wasFilled.current;
    const justCleared = !filled && wasFilled.current;
    wasFilled.current = filled;

    if (!animateFill) {
      dotAnim.value = filled ? 1 : 0;
      return;
    }

    if (reduceMotion) {
      dotAnim.value = filled ? 1 : 0;
      return;
    }

    if (justFilled) {
      dotAnim.value = 0;
      dotAnim.value = withSequence(
        withSpring(1.3, SPRING_DOT_POP),
        withSpring(1, SPRING_DOT_SETTLE),
      );
      return;
    }

    if (justCleared) {
      dotAnim.value = withSpring(0, SPRING_DOT_CLEAR);
      return;
    }

    dotAnim.value = filled ? 1 : 0;
  }, [animateFill, dotAnim, filled, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotAnim.value }],
    opacity: interpolate(dotAnim.value, [0, 1], [0, 1]),
  }));

  const emptyStyle =
    variant === 'quiet'
      ? styles.dotEmptyQuiet
      : variant === 'welcomeBack'
        ? styles.dotEmptyWelcome
        : styles.dotEmpty;
  const filledStyle =
    variant === 'quiet'
      ? styles.dotFilledQuiet
      : variant === 'welcomeBack'
        ? styles.dotFilledWelcome
        : styles.dotFilled;

  return (
    <Animated.View
      style={[
        styles.dot,
        filled ? filledStyle : emptyStyle,
        animateFill ? animStyle : null,
      ]}
    />
  );
});

export const PinDots = memo(function PinDots({
  filledCount,
  length = TRANSACTION_PIN_LENGTH,
  animateFill = false,
  shakeStyle,
  style,
  variant = 'default',
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;

  const row = (
    <View style={[styles.row, style]}>
      {Array.from({ length }).map((_, index) => (
        <PinDot
          key={index}
          filled={index < filledCount}
          reduceMotion={reduceMotion}
          animateFill={animateFill}
          variant={variant}
        />
      ))}
    </View>
  );

  if (shakeStyle) {
    return <Animated.View style={shakeStyle}>{row}</Animated.View>;
  }

  return row;
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  dotFilled: {
    backgroundColor: GOLD,
    borderWidth: 0,
  },
  dotEmptyWelcome: {
    backgroundColor: '#1E2A3A',
    borderWidth: 0,
  },
  dotFilledWelcome: {
    backgroundColor: GOLD,
    borderWidth: 0,
  },
  dotEmptyQuiet: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  dotFilledQuiet: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
});
