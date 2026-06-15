import { StyleSheet, Text } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { AuthVariant } from '@/components/auth/authTypes';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { MONITORING_AUTH } from '@/theme/monitoringAuthTheme';
import { C, F } from '@/theme/authTheme';

type Props = {
  char: string;
  focused: boolean;
  filled: boolean;
  error: boolean;
  scale?: SharedValue<number>;
  variant?: AuthVariant;
};

export function OtpBox({ char, focused, filled, error, scale, variant = 'default' }: Props) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale?.value ?? 1 }],
  }));

  if (variant === 'monitoring') {
    return (
      <Animated.View
        style={[
          styles.monitoringBox,
          animStyle,
          focused && styles.monitoringBoxFocused,
          filled && styles.monitoringBoxFilled,
          error && styles.boxError,
        ]}
      >
        <Text style={styles.boxText}>{char}</Text>
      </Animated.View>
    );
  }

  if (variant === 'esopay') {
    const borderWidth = error ? 2 : focused ? 2 : filled ? 1 : 0;
    const borderColor = error
      ? C.ERROR
      : focused
        ? ESOPAY_SIGN_IN.gold
        : filled
          ? ESOPAY_SIGN_IN.teal
          : 'transparent';

    return (
      <Animated.View style={[styles.esopayBox, animStyle, { borderWidth, borderColor }]}>
        <Text style={styles.esopayBoxText}>{char}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.box,
        animStyle,
        focused && styles.boxFocused,
        filled && styles.boxFilled,
        error && styles.boxError,
      ]}
    >
      <Text style={styles.boxText}>{char}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  monitoringBox: {
    width: 46,
    height: 58,
    borderRadius: 12,
    backgroundColor: MONITORING_AUTH.card,
    borderWidth: 1.5,
    borderColor: MONITORING_AUTH.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monitoringBoxFocused: {
    borderColor: MONITORING_AUTH.teal,
  },
  monitoringBoxFilled: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  box: {
    width: 46,
    height: 58,
    borderRadius: 12,
    backgroundColor: C.DARK_2,
    borderWidth: 1.5,
    borderColor: C.DARK_3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: C.GOLD_MID,
    shadowColor: C.GOLD_MID,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  boxFilled: { borderColor: C.DARK_4, backgroundColor: C.DARK_3 },
  boxError: { borderColor: C.ERROR },
  boxText: { fontFamily: F.cormorant, fontSize: 28, color: C.WHITE },
  esopayBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: ESOPAY_SIGN_IN.otpBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  esopayBoxText: {
    fontFamily: inter.semibold,
    fontSize: 24,
    color: ESOPAY_SIGN_IN.warmWhite,
  },
});
