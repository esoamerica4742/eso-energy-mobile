import { memo, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Delete } from 'lucide-react-native';
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
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { inter } from '@/theme/fonts';
import { GOLD } from '@/theme/colors';

const WARM_WHITE = '#F5F0E8';
const PIN_KEY_WIDTH = 96;
const PIN_KEY_HEIGHT = 72;
const PIN_KEY_GAP_H = 12;
const PIN_KEY_GAP_V = 14;
const PIN_KEY_BG = '#1A1F2E';
const PIN_KEY_PRESSED_BG = '#252B3D';

type Variant = 'default' | 'gate' | 'login';

type Props = {
  title: string;
  subtitle?: string;
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
  variant,
}: {
  filled: boolean;
  variant: Variant;
}) {
  const dotAnim = useSharedValue(filled ? 1 : 0);
  const wasFilled = useRef(filled);

  useEffect(() => {
    const justFilled = filled && !wasFilled.current;
    const justCleared = !filled && wasFilled.current;
    wasFilled.current = filled;

    if (variant !== 'gate') {
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
  }, [dotAnim, filled, variant]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: variant === 'gate' ? dotAnim.value : 1 }],
    opacity: variant === 'gate' ? interpolate(dotAnim.value, [0, 1], [0, 1]) : 1,
  }));

  if (variant === 'gate') {
    return (
      <Animated.View
        style={[styles.gateDot, filled && styles.gateDotFilled, animStyle]}
      />
    );
  }

  return <View style={[styles.dot, filled && styles.dotFilled]} />;
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
  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: pressed.value ? PIN_KEY_PRESSED_BG : PIN_KEY_BG,
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(0.96, SPRING_CARD_PRESS_IN);
    pressed.value = 1;
  }, [disabled, pressed, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(1, SPRING_CARD_PRESS_OUT);
    pressed.value = withTiming(0, { duration: 120 });
  }, [disabled, pressed, scale]);

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

  const dots = useMemo(
    () => Array.from({ length: maxLength }, (_, index) => index < value.length),
    [maxLength, value.length],
  );

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

  return (
    <View style={[styles.wrap, isGate && styles.gateWrap]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isGate && styles.gateSubtitle]}>{subtitle}</Text>
      ) : null}

      <Animated.View style={[styles.dotsRow, shakeStyle]}>
        {dots.map((filled, index) => (
          <PinDot key={index} filled={filled} variant={variant} />
        ))}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.keypad, isGate && styles.gateKeypad, disabled && styles.keypadDisabled]}>
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
                    disabled={disabled || !showBackspace}
                  >
                    <Delete
                      size={24}
                      color={showBackspace ? WARM_WHITE : colors.muted}
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
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  gateWrap: {
    paddingBottom: 0,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  gateSubtitle: {
    color: 'rgba(255,255,255,0.45)',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: spacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  gateDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'transparent',
  },
  gateDotFilled: {
    backgroundColor: GOLD,
    borderWidth: 0,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  error: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: PIN_KEY_WIDTH * 3 + PIN_KEY_GAP_H * 2,
    gap: PIN_KEY_GAP_V,
    marginTop: spacing.md,
  },
  gateKeypad: {
    marginTop: 40,
  },
  keypadDisabled: {
    opacity: 0.45,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: PIN_KEY_GAP_H,
  },
  key: {
    width: PIN_KEY_WIDTH,
    height: PIN_KEY_HEIGHT,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySpacer: {
    width: PIN_KEY_WIDTH,
    height: PIN_KEY_HEIGHT,
  },
  keyLabel: {
    fontFamily: inter.regular,
    fontSize: 28,
    fontWeight: '500',
    color: WARM_WHITE,
  },
});
