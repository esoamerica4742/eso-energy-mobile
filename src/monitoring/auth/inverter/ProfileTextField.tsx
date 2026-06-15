import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { inter } from '@/theme/fonts';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

type Props = TextInputProps & {
  label: string;
  optional?: boolean;
  error?: string;
};

export function ProfileTextField({
  label,
  optional = false,
  error,
  onFocus,
  onBlur,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {optional ? <Text style={styles.optional}> (optional)</Text> : null}
      </Text>
      <TextInput
        {...rest}
        style={[
          styles.input,
          {
            borderColor: error
              ? INVERTER_AUTH.ERROR
              : focused
                ? INVERTER_AUTH.TEAL
                : INVERTER_AUTH.BORDER_DEFAULT,
          },
          style,
        ]}
        placeholderTextColor={INVERTER_AUTH.TEXT_SECONDARY}
        cursorColor={INVERTER_AUTH.TEAL}
        selectionColor={INVERTER_AUTH.TEAL}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.semibold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  optional: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontWeight: '400',
    letterSpacing: 0,
  },
  input: {
    height: 56,
    borderRadius: INVERTER_AUTH.INPUT_RADIUS,
    borderWidth: 1.5,
    backgroundColor: INVERTER_AUTH.BG_SURFACE,
    paddingHorizontal: 16,
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.regular,
    fontSize: 16,
  },
  error: {
    color: INVERTER_AUTH.ERROR,
    fontFamily: inter.regular,
    fontSize: 13,
  },
});
