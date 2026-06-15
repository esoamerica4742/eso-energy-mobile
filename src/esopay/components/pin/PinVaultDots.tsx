import { memo, useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  SPRING_DOT_CLEAR,
  SPRING_DOT_POP,
  SPRING_DOT_SETTLE,
} from '@/lib/motion/springMotion';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';

const GOLD = '#C9A84C';
const ERROR_RED = '#EF4444';
const DOT_EMPTY_BG = '#1C2030';
const DOT_EMPTY_BORDER = '#2A3040';

const FILL_SPRING_OUT = SPRING_DOT_POP;
const FILL_SPRING_SETTLE = SPRING_DOT_SETTLE;

type DotState = 'empty' | 'active' | 'filled' | 'error';

type PinVaultDotProps = {
  state: DotState;
  reduceMotion: boolean;
};

const PinVaultDot = memo(function PinVaultDot({ state, reduceMotion }: PinVaultDotProps) {
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const prevStateRef = useRef<DotState>(state);

  useEffect(() => {
    const wasFilled = prevStateRef.current === 'filled';
    prevStateRef.current = state;

    if (state === 'error') {
      scale.value = 1;
      pulseOpacity.value = 1;
      return;
    }

    if (state === 'filled' && !wasFilled) {
      if (reduceMotion) {
        scale.value = 1;
        return;
      }
      scale.value = 0;
      scale.value = withSequence(
        withSpring(1.3, FILL_SPRING_OUT),
        withSpring(1, FILL_SPRING_SETTLE),
      );
      return;
    }

    if (state !== 'filled' && wasFilled) {
      if (reduceMotion) {
        scale.value = 1;
        return;
      }
      scale.value = withSpring(0, SPRING_DOT_CLEAR);
      return;
    }

    if (state === 'active' && !reduceMotion) {
      pulseOpacity.value = withRepeat(withTiming(0.4, { duration: 450 }), -1, true);
      return;
    }

    pulseOpacity.value = 1;
    if (state !== 'filled') {
      scale.value = 1;
    }
  }, [pulseOpacity, reduceMotion, scale, state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: state === 'active' ? pulseOpacity.value : 1,
  }));

  const dotStyle =
    state === 'error'
      ? styles.dotError
      : state === 'filled'
        ? styles.dotFilled
        : state === 'active'
          ? styles.dotActive
          : styles.dotEmpty;

  return <Animated.View style={[styles.dot, dotStyle, animStyle]} />;
});

type Props = {
  filledCount: number;
  errorFlash?: boolean;
  shakeStyle?: AnimatedStyle<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export const PinVaultDots = memo(function PinVaultDots({
  filledCount,
  errorFlash = false,
  shakeStyle,
  style,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;

  const row = (
    <View style={[styles.row, style]}>
      {Array.from({ length: TRANSACTION_PIN_LENGTH }).map((_, index) => {
        let state: DotState = 'empty';
        if (errorFlash) {
          state = 'error';
        } else if (index < filledCount) {
          state = 'filled';
        } else if (index === filledCount) {
          state = 'active';
        }

        return <PinVaultDot key={index} state={state} reduceMotion={reduceMotion} />;
      })}
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
    gap: 16,
    marginTop: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotEmpty: {
    backgroundColor: DOT_EMPTY_BG,
    borderWidth: 1,
    borderColor: DOT_EMPTY_BORDER,
  },
  dotFilled: {
    backgroundColor: GOLD,
    borderWidth: 0,
  },
  dotActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  dotError: {
    backgroundColor: ERROR_RED,
    borderWidth: 0,
  },
});
