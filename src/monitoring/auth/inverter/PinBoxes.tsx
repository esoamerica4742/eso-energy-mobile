import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import Animated, {
  type AnimatedStyle,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

const CREATE_BOX_WIDTH = 56;
const CREATE_BOX_HEIGHT = 64;
const CREATE_GAP = 12;
const UNLOCK_BOX_WIDTH = 56;
const UNLOCK_BOX_HEIGHT = 64;
const UNLOCK_GAP = 14;

type Variant = 'create' | 'unlock';

type Props = {
  value: string;
  length: number;
  onChange: (value: string) => void;
  onComplete?: (pin: string) => void;
  shakeStyle?: AnimatedStyle;
  error?: boolean;
  disabled?: boolean;
  loading?: boolean;
  centered?: boolean;
  variant?: Variant;
};

function PinBox({
  isFilled,
  isActive,
  error,
  variant,
  loading,
  disabled,
}: {
  isFilled: boolean;
  isActive: boolean;
  error: boolean;
  variant: Variant;
  loading: boolean;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const wasFilled = useRef(isFilled);

  useEffect(() => {
    if (isFilled && !wasFilled.current && !error && !disabled) {
      scale.value = withSequence(
        withSpring(1.05, { damping: 12, stiffness: 400 }),
        withSpring(1, { damping: 14, stiffness: 320 }),
      );
    }
    wasFilled.current = isFilled;
  }, [disabled, error, isFilled, scale]);

  const boxAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const useTealFill = isFilled && !error && !disabled;
  const borderColor = error
    ? INVERTER_AUTH.ERROR
    : isActive && !useTealFill
      ? INVERTER_AUTH.TEAL
      : useTealFill
        ? 'transparent'
        : INVERTER_AUTH.BORDER_DEFAULT;

  return (
    <Animated.View
      style={[
        variant === 'unlock' ? styles.unlockBox : styles.createBox,
        useTealFill
          ? styles.filled
          : {
              borderColor,
              borderWidth: 1.5,
              backgroundColor: INVERTER_AUTH.BG_SURFACE,
            },
        boxAnim,
      ]}
    />
  );
}

export function PinBoxes({
  value,
  length,
  onChange,
  onComplete,
  shakeStyle,
  error = false,
  disabled = false,
  loading = false,
  centered = false,
  variant = 'create',
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const loadOpacity = useSharedValue(1);

  useEffect(() => {
    if (loading) {
      loadOpacity.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      return;
    }
    loadOpacity.value = withTiming(1, { duration: 200 });
  }, [loadOpacity, loading]);

  const loadingStyle = useAnimatedStyle(() => ({
    opacity: loadOpacity.value,
  }));

  const handleChange = useCallback(
    (text: string) => {
      if (disabled || loading) return;
      const digits = text.replace(/\D/g, '').slice(0, length);
      onChange(digits);
      if (digits.length === length) {
        onComplete?.(digits);
      }
    },
    [disabled, length, loading, onChange, onComplete],
  );

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <AuthPressable
      onPress={() => !disabled && !loading && inputRef.current?.focus()}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          variant === 'unlock' ? styles.unlockRow : styles.createRow,
          centered && styles.rowCentered,
          shakeStyle,
          loading ? loadingStyle : null,
        ]}
      >
        {Array.from({ length }, (_, index) => {
          const isFilled = index < value.length;
          const isActive = index === activeIndex && value.length < length;

          return (
            <PinBox
              key={index}
              isFilled={isFilled}
              isActive={isActive}
              error={error}
              variant={variant}
              loading={loading}
              disabled={disabled}
            />
          );
        })}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        secureTextEntry
        style={styles.hiddenInput}
        editable={!disabled && !loading}
      />
    </AuthPressable>
  );
}

const styles = StyleSheet.create({
  createRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: CREATE_GAP,
  },
  unlockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: UNLOCK_GAP,
  },
  rowCentered: {
    justifyContent: 'center',
  },
  createBox: {
    width: CREATE_BOX_WIDTH,
    height: CREATE_BOX_HEIGHT,
    borderRadius: INVERTER_AUTH.BOX_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockBox: {
    width: UNLOCK_BOX_WIDTH,
    height: UNLOCK_BOX_HEIGHT,
    borderRadius: INVERTER_AUTH.BOX_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: INVERTER_AUTH.TEAL,
    borderWidth: 0,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
