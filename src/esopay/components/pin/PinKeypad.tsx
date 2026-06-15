import { memo, useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Backspace, Fingerprint } from 'phosphor-react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { inter } from '@/theme/fonts';

const WARM_WHITE = '#F5F0E8';
const GOLD = '#E8A020';
const KEY_BG = '#12171F';
const KEY_PRESSED = '#1E2A38';
const KEY_BORDER = 'rgba(245, 240, 232, 0.06)';
const KEY_HEIGHT = 72;
const WELCOME_KEY_BG = '#1A1F2E';
const WELCOME_KEY_PRESSED = '#222840';
const WELCOME_KEY_BORDER = '#1E2A3A';
const WELCOME_KEY_SIZE = 80;
const KEY_SPRING = { damping: 18, stiffness: 320, mass: 0.7 };
const PRESS_TIMING = { duration: 80 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PinKeypadVariant = 'default' | 'welcomeBack';

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

type Props = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
  backspaceDisabled?: boolean;
  showBiometric?: boolean;
  onBiometricPress?: () => void;
  horizontalPadding?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  variant?: PinKeypadVariant;
};

const KeypadKey = memo(function KeypadKey({
  label,
  onPress,
  disabled,
  reduceMotion,
  accessibilityLabel,
  children,
  variant,
}: {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  reduceMotion: boolean;
  accessibilityLabel: string;
  children?: ReactNode;
  variant: PinKeypadVariant;
}) {
  const keyBg = variant === 'welcomeBack' ? WELCOME_KEY_BG : KEY_BG;
  const keyPressed = variant === 'welcomeBack' ? WELCOME_KEY_PRESSED : KEY_PRESSED;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const bg = useSharedValue(keyBg);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: bg.value,
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    bg.value = keyPressed;
    if (reduceMotion) return;
    scale.value = withTiming(0.93, PRESS_TIMING);
    opacity.value = withTiming(0.65, PRESS_TIMING);
  }, [disabled, keyPressed, opacity, reduceMotion, scale, bg]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    bg.value = withTiming(keyBg, { duration: 120 });
    if (reduceMotion) return;
    scale.value = withSpring(1, KEY_SPRING);
    opacity.value = withTiming(1, PRESS_TIMING);
  }, [disabled, keyBg, opacity, reduceMotion, scale, bg]);

  const slotStyle = variant === 'welcomeBack' ? styles.keySlotWelcome : styles.keySlot;
  const cellStyle = variant === 'welcomeBack' ? styles.keyCellWelcome : styles.keyCell;

  return (
    <View style={slotStyle}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          cellStyle,
          variant === 'welcomeBack' ? styles.keyCellWelcomeBorder : null,
          animStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: Boolean(disabled) }}
      >
        {children ?? (
          <Text style={variant === 'welcomeBack' ? styles.keyLabelWelcome : styles.keyLabel}>
            {label}
          </Text>
        )}
      </AnimatedPressable>
    </View>
  );
});

export const PinKeypad = memo(function PinKeypad({
  onDigit,
  onBackspace,
  disabled = false,
  backspaceDisabled = false,
  showBiometric = false,
  onBiometricPress,
  horizontalPadding = 24,
  gap = 12,
  style,
  variant = 'default',
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const rowStyle = variant === 'welcomeBack' ? styles.keyRowWelcome : styles.keyRow;
  const emptySlotStyle = variant === 'welcomeBack' ? styles.keySlotWelcome : styles.keySlot;
  const backspaceColor = variant === 'welcomeBack' ? GOLD : WARM_WHITE;

  return (
    <View style={[styles.keypad, { paddingHorizontal: horizontalPadding, gap }, style]}>
      {KEYPAD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={[rowStyle, { gap }]}>
          {row.map((key) => (
            <KeypadKey
              key={key}
              label={key}
              onPress={() => onDigit(key)}
              disabled={disabled}
              reduceMotion={reduceMotion}
              accessibilityLabel={`Digit ${key}`}
              variant={variant}
            />
          ))}
        </View>
      ))}

      <View style={[rowStyle, { gap }]}>
        {showBiometric && onBiometricPress ? (
          <KeypadKey
            onPress={onBiometricPress}
            disabled={disabled}
            reduceMotion={reduceMotion}
            accessibilityLabel="Unlock with biometrics"
            variant={variant}
          >
            <Fingerprint
              size={24}
              color={WARM_WHITE}
              weight="duotone"
              duotoneColor={WARM_WHITE}
            />
          </KeypadKey>
        ) : (
          <View style={emptySlotStyle} />
        )}
        <KeypadKey
          label="0"
          onPress={() => onDigit('0')}
          disabled={disabled}
          reduceMotion={reduceMotion}
          accessibilityLabel="Digit 0"
          variant={variant}
        />
        <KeypadKey
          onPress={onBackspace}
          disabled={disabled || backspaceDisabled}
          reduceMotion={reduceMotion}
          accessibilityLabel="Backspace"
          variant={variant}
        >
          <Backspace size={28} color={backspaceColor} weight="regular" />
        </KeypadKey>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  keypad: {
    width: '100%',
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyRowWelcome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySlot: {
    flex: 1,
    height: KEY_HEIGHT,
  },
  keySlotWelcome: {
    width: WELCOME_KEY_SIZE,
    height: WELCOME_KEY_SIZE,
  },
  keyCell: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KEY_BORDER,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyCellWelcome: {
    width: WELCOME_KEY_SIZE,
    height: WELCOME_KEY_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyCellWelcomeBorder: {
    borderWidth: 1,
    borderColor: WELCOME_KEY_BORDER,
  },
  keyLabel: {
    fontFamily: inter.medium,
    fontSize: 24,
    color: WARM_WHITE,
  },
  keyLabelWelcome: {
    fontFamily: inter.semibold,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

