import { memo, useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { inter } from '@/theme/fonts';

const TEXT_PRIMARY = '#F5F0E8';
const GOLD = '#C9A84C';
const KEY_IDLE_BG = '#0D1018';
const KEY_PRESS_BG = '#161B28';
const KEY_IDLE_BORDER = '#1C2030';
const KEY_PRESS_BORDER = 'rgba(201, 168, 76, 0.19)';
const KEY_HEIGHT = 72;
const KEY_SPRING = { stiffness: 300, damping: 20 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  style?: StyleProp<ViewStyle>;
};

const VaultKey = memo(function VaultKey({
  label,
  onPress,
  disabled,
  reduceMotion,
  accessibilityLabel,
  children,
}: {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  reduceMotion: boolean;
  accessibilityLabel: string;
  children?: ReactNode;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const bg = useSharedValue(KEY_IDLE_BG);
  const border = useSharedValue(KEY_IDLE_BORDER);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: bg.value,
    borderColor: border.value,
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    bg.value = KEY_PRESS_BG;
    border.value = KEY_PRESS_BORDER;
    if (reduceMotion) {
      opacity.value = 0.8;
      return;
    }
    scale.value = withTiming(0.92, { duration: 80 });
    opacity.value = withTiming(0.8, { duration: 80 });
  }, [bg, border, disabled, opacity, reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    bg.value = KEY_IDLE_BG;
    border.value = KEY_IDLE_BORDER;
    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    scale.value = withSpring(1, KEY_SPRING);
    opacity.value = withTiming(1, { duration: 100 });
  }, [bg, border, disabled, opacity, reduceMotion, scale]);

  return (
    <View style={styles.keySlot}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.keyCell, animStyle]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: Boolean(disabled) }}
      >
        {children ?? <Text style={styles.keyLabel}>{label}</Text>}
      </AnimatedPressable>
    </View>
  );
});

export const PinVaultKeypad = memo(function PinVaultKeypad({
  onDigit,
  onBackspace,
  disabled = false,
  backspaceDisabled = false,
  style,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <View style={[styles.keypad, style]}>
      {KEYPAD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyRow}>
          {row.map((key) => (
            <VaultKey
              key={key}
              label={key}
              onPress={() => onDigit(key)}
              disabled={disabled}
              reduceMotion={reduceMotion}
              accessibilityLabel={`Digit ${key}`}
            />
          ))}
        </View>
      ))}

      <View style={styles.keyRow}>
        <View style={styles.keySlot} />
        <VaultKey
          label="0"
          onPress={() => onDigit('0')}
          disabled={disabled}
          reduceMotion={reduceMotion}
          accessibilityLabel="Digit 0"
        />
        <VaultKey
          onPress={onBackspace}
          disabled={disabled || backspaceDisabled}
          reduceMotion={reduceMotion}
          accessibilityLabel="Backspace"
        >
          <ArrowLeft size={22} color={GOLD} weight="regular" />
        </VaultKey>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  keypad: {
    width: '100%',
    marginTop: 36,
    paddingHorizontal: 32,
    gap: 10,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keySlot: {
    flex: 1,
    height: KEY_HEIGHT,
  },
  keyCell: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontFamily: inter.medium,
    fontSize: 24,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
});
