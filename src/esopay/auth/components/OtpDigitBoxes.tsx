import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { PayBills, PayBillsFonts } from '@/esopay/auth/payBillsTheme';
import { useShake } from '@/esopay/auth/hooks/useShake';

const BOX_COUNT = 6;

type BoxState = 'default' | 'error' | 'success';

type Props = {
  value: string;
  onChange: (code: string) => void;
  boxState?: BoxState;
  onShake?: () => void;
};

export function OtpDigitBoxes({ value, onChange, boxState = 'default', onShake }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);
  const hiddenRef = useRef<TextInput>(null);
  const digits = value.padEnd(BOX_COUNT, ' ').slice(0, BOX_COUNT).split('');
  const { shakeX, shake } = useShake();
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (boxState === 'error') {
      shake();
      onShake?.();
    }
  }, [boxState, shake, onShake]);

  const setDigitAt = useCallback(
    (index: number, char: string) => {
      const next = value.split('');
      while (next.length < BOX_COUNT) next.push('');
      next[index] = char;
      onChange(next.join('').replace(/\s/g, '').slice(0, BOX_COUNT));
    },
    [onChange, value],
  );

  const handleChange = useCallback(
    (index: number, text: string) => {
      const cleaned = text.replace(/\D/g, '');
      if (cleaned.length > 1) {
        onChange(cleaned.slice(0, BOX_COUNT));
        refs.current[Math.min(cleaned.length, BOX_COUNT) - 1]?.focus();
        return;
      }
      setDigitAt(index, cleaned);
      if (cleaned && index < BOX_COUNT - 1) {
        refs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    },
    [onChange, setDigitAt],
  );

  const handleKeyPress = useCallback(
    (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
        refs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        setDigitAt(index - 1, '');
      }
    },
    [digits, setDigitAt],
  );

  const borderFor = (i: number) => {
    if (boxState === 'error') return PayBills.error;
    if (boxState === 'success') return PayBills.success;
    const filled = Boolean(digits[i]?.trim());
    if (focusedIndex === i || filled) return PayBills.borderFocus;
    return PayBills.borderDefault;
  };

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
      <TextInput
        ref={hiddenRef}
        value={value}
        onChangeText={(t) => {
          const c = t.replace(/\D/g, '').slice(0, BOX_COUNT);
          onChange(c);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        style={styles.hidden}
        maxLength={BOX_COUNT}
      />
      {digits.map((d, i) => (
        <Pressable key={i} onPress={() => refs.current[i]?.focus()} style={styles.boxPress}>
          <View
            style={[
              styles.box,
              {
                borderColor: borderFor(i),
                shadowColor: focusedIndex === i ? '#FFFFFF' : 'transparent',
                shadowOpacity: focusedIndex === i ? 0.05 : 0,
                shadowRadius: focusedIndex === i ? 3 : 0,
              },
            ]}
          >
            <TextInput
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d.trim()}
              onChangeText={(t) => handleChange(i, t)}
              onKeyPress={(e) => handleKeyPress(i, e)}
              onFocus={() => setFocusedIndex(i)}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.digit}
              selectTextOnFocus
            />
          </View>
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  boxPress: { flex: 1 },
  box: {
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: PayBills.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    width: '100%',
    textAlign: 'center',
    fontFamily: PayBillsFonts.sora,
    fontSize: 24,
    color: PayBills.textPrimary,
    padding: 0,
  },
});
