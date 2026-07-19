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

const GOLD = '#FFFFFF';
const ERROR_RED = '#EF4444';
const DOT_EMPTY_BG = '#1C1C1E';
const DOT_EMPTY_BORDER = '#2C2C2E';

const FILL_SPRING_OUT = SPRING_DOT_POP;
const FILL_SPRING_SETTLE = SPRING_DOT_SETTLE;

type DotState = 'empty' | 'active' | 'filled' | 'error';

type PinVaultDotProps = {
  state: DotState;
  reduceMotion: boolean;
  premium?: boolean;
};

const PinVaultDot = memo(function PinVaultDot({ state, reduceMotion, premium }: PinVaultDotProps) {
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
      ? premium
        ? styles.dotErrorPremium
        : styles.dotError
      : state === 'filled'
        ? premium
          ? styles.dotFilledPremium
          : styles.dotFilled
        : state === 'active'
          ? premium
            ? styles.dotActivePremium
            : styles.dotActive
          : premium
            ? styles.dotEmptyPremium
            : styles.dotEmpty;

  return <Animated.View style={[styles.dot, premium && styles.dotPremium, dotStyle, animStyle]} />;
});

type Props = {
  filledCount: number;
  errorFlash?: boolean;
  shakeStyle?: AnimatedStyle<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  size?: 'default' | 'premium';
};

export const PinVaultDots = memo(function PinVaultDots({
  filledCount,
  errorFlash = false,
  shakeStyle,
  style,
  size = 'default',
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const isPremium = size === 'premium';
  const rowStyle = isPremium ? styles.rowPremium : styles.row;

  const row = (
    <View style={[rowStyle, style]}>
      {Array.from({ length: TRANSACTION_PIN_LENGTH }).map((_, index) => {
        let state: DotState = 'empty';
        if (errorFlash) {
          state = 'error';
        } else if (index < filledCount) {
          state = 'filled';
        } else if (index === filledCount) {
          state = 'active';
        }

        return <PinVaultDot key={index} state={state} reduceMotion={reduceMotion} premium={isPremium} />;
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
  rowPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotPremium: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  dotFilled: {
    backgroundColor: GOLD,
    borderWidth: 0,
  },
  dotActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  dotError: {
    backgroundColor: ERROR_RED,
    borderWidth: 0,
  },
  dotEmptyPremium: {
    backgroundColor: '#121722',
    borderWidth: 1.5,
    borderColor: '#3A4558',
  },
  dotFilledPremium: {
    backgroundColor: GOLD,
    borderWidth: 0,
    shadowColor: GOLD,
    shadowOpacity: 0.52,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  dotActivePremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  dotErrorPremium: {
    backgroundColor: ERROR_RED,
    borderWidth: 0,
    shadowColor: ERROR_RED,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
