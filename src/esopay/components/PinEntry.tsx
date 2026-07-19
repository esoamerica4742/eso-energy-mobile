import { memo, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Backspace } from 'phosphor-react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  SPRING_CARD_PRESS_IN,
  SPRING_CARD_PRESS_OUT,
  SPRING_DOT_CLEAR,
  SPRING_DOT_POP,
  SPRING_DOT_SETTLE,
  useShakeAnimation,
} from '@/lib/motion/springMotion';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import { colors } from '@/esopay/theme/colors';
import { fonts } from '@/esopay/theme/typography';
import { inter } from '@/theme/fonts';

/** Revolut-standard PIN pad — borderless keys, solid dots, quiet type. */
const KEY_SIZE = 76;
const KEY_GAP = 8;

type Variant = 'default' | 'gate' | 'login';

type Props = {
  title: string;
  subtitle?: string;
  /** Large centered amount (payment confirm). */
  amountLabel?: string | null;
  value: string;
  onChange: (next: string) => void;
  onComplete?: (pin: string) => void;
  error?: string | null;
  maxLength?: number;
  showBackspace?: boolean;
  variant?: Variant;
  disabled?: boolean;
};

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'back'],
] as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PinDot = memo(function PinDot({
  filled,
  active,
}: {
  filled: boolean;
  active: boolean;
}) {
  const dotAnim = useSharedValue(filled ? 1 : 0);
  const wasFilled = useRef(filled);

  useEffect(() => {
    const justFilled = filled && !wasFilled.current;
    const justCleared = !filled && wasFilled.current;
    wasFilled.current = filled;

    if (justFilled) {
      dotAnim.value = 0;
      dotAnim.value = withSequence(
        withSpring(1.25, SPRING_DOT_POP),
        withSpring(1, SPRING_DOT_SETTLE),
      );
      return;
    }

    if (justCleared) {
      dotAnim.value = withSpring(0, SPRING_DOT_CLEAR);
      return;
    }

    dotAnim.value = filled ? 1 : 0;
  }, [dotAnim, filled]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(dotAnim.value, [0, 1], [0.55, 1]) }],
    opacity: filled ? 1 : active ? 0.85 : 1,
  }));

  if (filled) {
    return <Animated.View style={[styles.dotFill, animStyle]} />;
  }

  return <View style={[styles.dotWell, active && styles.dotWellActive]} />;
});

const KeypadKey = memo(function KeypadKey({
  onPress,
  disabled,
  children,
  style,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(0.88, SPRING_CARD_PRESS_IN);
    opacity.value = withTiming(0.35, { duration: 70 });
  }, [disabled, opacity, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(1, SPRING_CARD_PRESS_OUT);
    opacity.value = withTiming(1, { duration: 120 });
  }, [disabled, opacity, scale]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.key, animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
});

export const PinEntry = memo(function PinEntry({
  title,
  subtitle,
  amountLabel,
  value,
  onChange,
  onComplete,
  error,
  maxLength = TRANSACTION_PIN_LENGTH,
  showBackspace = true,
  variant = 'default',
  disabled = false,
}: Props) {
  const isGate = variant === 'gate';
  const { style: shakeStyle, shake } = useShakeAnimation();
  const prevError = useRef<string | null | undefined>(error);

  useEffect(() => {
    if (error && error !== prevError.current) {
      shake();
    }
    prevError.current = error;
  }, [error, shake]);

  const appendDigit = useCallback(
    async (digit: string) => {
      if (disabled || value.length >= maxLength) return;
      await Haptics.selectionAsync();
      const next = `${value}${digit}`;
      onChange(next);
      if (next.length === maxLength) onComplete?.(next);
    },
    [disabled, maxLength, onChange, onComplete, value],
  );

  const handleBackspace = useCallback(async () => {
    if (disabled || !value) return;
    await Haptics.selectionAsync();
    onChange(value.slice(0, -1));
  }, [disabled, onChange, value]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === 'back') {
        if (showBackspace) void handleBackspace();
        return;
      }
      if (!key) return;
      void appendDigit(key);
    },
    [appendDigit, handleBackspace, showBackspace],
  );

  const dots = useMemo(
    () => Array.from({ length: maxLength }, (_, index) => index < value.length),
    [maxLength, value.length],
  );

  return (
    <View style={[styles.wrap, isGate && styles.gateWrap]}>
      <Text style={styles.title}>{title}</Text>
      {amountLabel ? <Text style={styles.amount}>{amountLabel}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <Animated.View style={[styles.dotsRow, shakeStyle]}>
        {dots.map((filled, index) => (
          <PinDot key={index} filled={filled} active={index === value.length} />
        ))}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.keypad, disabled && styles.keypadDisabled]}>
        {KEYPAD.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => {
              if (key === '') {
                return <View key="spacer" style={styles.keySpacer} accessibilityElementsHidden />;
              }
              if (key === 'back') {
                return (
                  <KeypadKey
                    key="back"
                    onPress={() => handleKeyPress('back')}
                    disabled={disabled || !showBackspace || value.length === 0}
                  >
                    <Backspace
                      size={26}
                      color={
                        showBackspace && value.length > 0
                          ? '#FFFFFF'
                          : 'rgba(255,255,255,0.22)'
                      }
                      weight="regular"
                    />
                  </KeypadKey>
                );
              }
              return (
                <KeypadKey key={key} onPress={() => handleKeyPress(key)} disabled={disabled}>
                  <Text style={styles.keyLabel}>{key}</Text>
                </KeypadKey>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  gateWrap: {
    paddingBottom: 0,
  },
  title: {
    fontFamily: fonts.uiMedium,
    fontSize: 20,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
  },
  amount: {
    marginTop: 10,
    fontFamily: fonts.uiBold,
    fontSize: 32,
    letterSpacing: -0.8,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    paddingHorizontal: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 28,
    marginBottom: 8,
    minHeight: 18,
  },
  dotWell: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotWellActive: {
    borderColor: 'rgba(255,255,255,0.55)',
  },
  dotFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  error: {
    marginTop: 10,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: KEY_SIZE * 3 + KEY_GAP * 2,
    gap: KEY_GAP,
    marginTop: 36,
  },
  keypadDisabled: {
    opacity: 0.4,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: KEY_GAP,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  keySpacer: {
    width: KEY_SIZE,
    height: KEY_SIZE,
  },
  keyLabel: {
    fontFamily: inter.regular,
    fontSize: 30,
    fontWeight: '400',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
