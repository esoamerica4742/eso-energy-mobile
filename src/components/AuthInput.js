import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { C, F } from '../theme/authTheme';

const AnimatedView = Animated.createAnimatedComponent(View);

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoFocus = false,
  error,
  maxLength,
  secureTextEntry = false,
  editable = true,
  autoCapitalize = 'none',
  autoCorrect = false,
  onBlur,
  onFocus,
  variant = 'default',
}) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);
  const errorAnim = useSharedValue(0);
  const isEsoPay = variant === 'esopay';

  useEffect(() => {
    focus.value = withSpring(focused ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [focused, focus]);

  useEffect(() => {
    errorAnim.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error, errorAnim]);

  const wrapperStyle = useAnimatedStyle(() => {
    if (isEsoPay) {
      const borderColor = error
        ? C.ERROR
        : interpolateColor(focus.value, [0, 1], [ESOPAY_SIGN_IN.border, ESOPAY_SIGN_IN.gold]);
      return { borderColor };
    }

    const borderColor = error
      ? C.ERROR
      : interpolateColor(focus.value, [0, 1], [C.DARK_3, C.GOLD_MID]);
    return {
      borderColor,
      shadowColor: C.GOLD_MID,
      shadowOpacity: focused && !error ? 0.15 : 0,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 },
      elevation: focused && !error ? 4 : 0,
    };
  });

  const errorStyle = useAnimatedStyle(() => ({
    opacity: errorAnim.value,
    transform: [{ translateY: (1 - errorAnim.value) * 4 }],
  }));

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, isEsoPay && styles.labelEsoPay]}>{label}</Text>
      ) : null}
      <AnimatedView
        style={[
          styles.wrapper,
          isEsoPay && styles.wrapperEsoPay,
          wrapperStyle,
        ]}
      >
        <TextInput
          style={[styles.input, isEsoPay && styles.inputEsoPay]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            isEsoPay ? ESOPAY_SIGN_IN.placeholder : 'rgba(232,232,224,0.2)'
          }
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          editable={editable}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      </AnimatedView>
      {error ? (
        <Animated.Text style={[styles.error, errorStyle]}>{error}</Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  label: {
    fontFamily: F.sansMed,
    fontSize: 12,
    color: C.OFF_WHITE,
    opacity: 0.5,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelEsoPay: {
    fontFamily: inter.medium,
    color: ESOPAY_SIGN_IN.muted,
    opacity: 1,
  },
  wrapper: {
    backgroundColor: C.DARK_2,
    borderRadius: 14,
    borderWidth: 1,
    height: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrapperEsoPay: {
    backgroundColor: ESOPAY_SIGN_IN.surface,
    borderRadius: 14,
  },
  input: {
    flex: 1,
    fontFamily: F.sansLight,
    fontSize: 16,
    color: C.WHITE,
  },
  inputEsoPay: {
    fontFamily: inter.regular,
    fontSize: 16,
    color: ESOPAY_SIGN_IN.warmWhite,
  },
  error: {
    fontFamily: F.sansLight,
    fontSize: 12,
    color: C.ERROR,
    marginTop: 6,
    marginLeft: 4,
  },
});
