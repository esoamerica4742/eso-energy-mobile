import { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import Animated, {
  type AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

const BOX_WIDTH = 48;
const BOX_HEIGHT = 56;
const BOX_GAP = 10;
const FILLED_DOT = 10;

type Props = {
  value: string;
  length: number;
  onChange: (value: string) => void;
  shakeStyle?: AnimatedStyle;
  error?: boolean;
};

function OtpBox({
  isActive,
  isFilled,
  error,
}: {
  isActive: boolean;
  isFilled: boolean;
  error: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.04, { damping: 14, stiffness: 320 });
      return;
    }
    scale.value = withSpring(1, { damping: 14, stiffness: 320 });
  }, [isActive, scale]);

  const boxAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderColor = error
    ? INVERTER_AUTH.ERROR
    : isActive || isFilled
      ? INVERTER_AUTH.TEAL
      : INVERTER_AUTH.BORDER_DEFAULT;

  return (
    <Animated.View style={[styles.box, { borderColor }, boxAnim]}>
      {isFilled ? <View style={styles.filledDot} /> : null}
    </Animated.View>
  );
}

export function OtpBoxes({ value, length, onChange, shakeStyle, error = false }: Props) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 280);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      onChange(text.replace(/\D/g, '').slice(0, length));
    },
    [length, onChange],
  );

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <AuthPressable onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[styles.row, shakeStyle]}>
        {Array.from({ length }, (_, index) => {
          const isActive = index === activeIndex && value.length < length;
          const isFilled = index < value.length;

          return (
            <OtpBox
              key={index}
              isActive={isActive}
              isFilled={isFilled}
              error={error}
            />
          );
        })}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        maxLength={length}
        style={styles.hiddenInput}
      />
    </AuthPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: BOX_GAP,
  },
  box: {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    borderRadius: INVERTER_AUTH.BOX_RADIUS,
    borderWidth: 1.5,
    backgroundColor: INVERTER_AUTH.BG_SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledDot: {
    width: FILLED_DOT,
    height: FILLED_DOT,
    borderRadius: FILLED_DOT / 2,
    backgroundColor: INVERTER_AUTH.TEAL,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
