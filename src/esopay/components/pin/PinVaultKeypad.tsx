import { memo, useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Backspace } from 'phosphor-react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { inter } from '@/theme/fonts';

const TEXT_PRIMARY = '#FFFFFF';
const KEY_SIZE = 76;
const KEY_SPRING = { stiffness: 320, damping: 22 };

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

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    if (reduceMotion) {
      opacity.value = 0.35;
      return;
    }
    scale.value = withTiming(0.88, { duration: 70 });
    opacity.value = withTiming(0.35, { duration: 70 });
  }, [disabled, opacity, reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    scale.value = withSpring(1, KEY_SPRING);
    opacity.value = withTiming(1, { duration: 120 });
  }, [disabled, opacity, reduceMotion, scale]);

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
          <Backspace
            size={26}
            color={backspaceDisabled || disabled ? 'rgba(255,255,255,0.22)' : TEXT_PRIMARY}
            weight="regular"
          />
        </VaultKey>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  keypad: {
    width: '100%',
    marginTop: 28,
    paddingHorizontal: 28,
    gap: 8,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keySlot: {
    flex: 1,
    height: KEY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyCell: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  keyLabel: {
    fontFamily: inter.regular,
    fontSize: 30,
    fontWeight: '400',
    color: TEXT_PRIMARY,
    includeFontPadding: false,
  },
});
