import { memo, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Delete } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

const LOGIN_GOLD = '#C9A84C';
const LOGIN_KEYPAD_BG = '#0D1117';
const LOGIN_KEYPAD_BORDER = 'rgba(255,255,255,0.06)';
const LOGIN_KEYPAD_PRESS_TINT = 'rgba(201, 168, 76, 0.08)';

type Variant = 'default' | 'login';

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
  const scale = useSharedValue(1);
  const wasFilled = useRef(filled);

  useEffect(() => {
    if (variant === 'login' && filled && !wasFilled.current) {
      scale.value = 0.8;
      scale.value = withSpring(1, { damping: 14, stiffness: 280 });
    }
    wasFilled.current = filled;
  }, [filled, scale, variant]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (variant === 'login') {
    return (
      <Animated.View
        style={[
          styles.loginDot,
          filled && styles.loginDotFilled,
          animStyle,
        ]}
      />
    );
  }

  return <View style={[styles.dot, filled && styles.dotFilled]} />;
});

const KeypadKey = memo(function KeypadKey({
  onPress,
  disabled,
  variant,
  children,
  style,
}: {
  onPress: () => void;
  disabled?: boolean;
  variant: Variant;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => {
    if (variant !== 'login') return {};
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: pressed.value ? LOGIN_KEYPAD_PRESS_TINT : LOGIN_KEYPAD_BG,
    };
  });

  const handlePressIn = useCallback(() => {
    if (variant !== 'login' || disabled) return;
    scale.value = withTiming(0.94, { duration: 60 });
    pressed.value = 1;
  }, [disabled, pressed, scale, variant]);

  const handlePressOut = useCallback(() => {
    if (variant !== 'login' || disabled) return;
    scale.value = withSpring(1, { damping: 16, stiffness: 320 });
    pressed.value = withTiming(0, { duration: 120 });
  }, [disabled, pressed, scale, variant]);

  if (variant === 'login') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.loginKey, animStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.key, style]}>
      {children}
    </Pressable>
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
}: Props) {
  const isLogin = variant === 'login';

  const dots = useMemo(
    () => Array.from({ length: maxLength }, (_, index) => index < value.length),
    [maxLength, value.length],
  );

  const appendDigit = useCallback(
    async (digit: string) => {
      if (value.length >= maxLength) return;
      await Haptics.selectionAsync();
      const next = `${value}${digit}`;
      onChange(next);
      if (next.length === maxLength) onComplete?.(next);
    },
    [maxLength, onChange, onComplete, value],
  );

  const handleBackspace = useCallback(async () => {
    if (!value) return;
    await Haptics.selectionAsync();
    onChange(value.slice(0, -1));
  }, [onChange, value]);

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
    <View style={[styles.wrap, isLogin && styles.loginWrap]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isLogin && styles.loginSubtitle]}>{subtitle}</Text>
      ) : null}

      <View style={styles.dotsRow}>
        {dots.map((filled, index) => (
          <PinDot key={index} filled={filled} variant={variant} />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.keypad, isLogin && styles.loginKeypad]}>
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
                    variant={variant}
                    onPress={() => handleKeyPress('back')}
                    disabled={!showBackspace}
                  >
                    <Delete size={20} color={showBackspace ? colors.white : colors.muted} />
                  </KeypadKey>
                );
              }
              return (
                <KeypadKey key={key} variant={variant} onPress={() => handleKeyPress(key)}>
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
  loginWrap: {
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
  loginSubtitle: {
    color: 'rgba(255,255,255,0.45)',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
  loginDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    backgroundColor: 'transparent',
  },
  loginDotFilled: {
    backgroundColor: LOGIN_GOLD,
    borderColor: LOGIN_GOLD,
    shadowColor: LOGIN_GOLD,
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
    maxWidth: 280,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  loginKeypad: {
    marginTop: 40,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  key: {
    width: 72,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginKey: {
    width: 72,
    height: 56,
    borderRadius: 16,
    backgroundColor: LOGIN_KEYPAD_BG,
    borderWidth: 1,
    borderColor: LOGIN_KEYPAD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySpacer: {
    width: 72,
    height: 56,
    backgroundColor: 'transparent',
  },
  keyLabel: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.white,
  },
});
