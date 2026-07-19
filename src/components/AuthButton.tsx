import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { AuthButtonVariant } from '@/components/auth/authTypes';
import { MotionPressable } from '@/lib/motion';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { MONITORING_AUTH } from '@/theme/monitoringAuthTheme';
import { C, F } from '@/theme/authTheme';

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: AuthButtonVariant;
  /** Eso Pay email step only — flat gold matching Add Funds. */
  goldCta?: boolean;
};

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  goldCta = false,
}: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);
  const activeOpacity = useSharedValue(disabled ? 0 : 1);

  const isEsoPay = variant === 'esopay';
  const isMonitoring = variant === 'monitoring';
  const isGhost = variant === 'ghost';
  const isPrimary = variant === 'primary' || variant === 'default' || isMonitoring;
  const isDisabled = disabled || loading;

  useEffect(() => {
    const duration = isEsoPay ? 150 : 200;
    activeOpacity.value = withTiming(disabled ? 0 : 1, { duration });
  }, [disabled, activeOpacity, isEsoPay]);

  useEffect(() => {
    if (loading && !disabled) {
      pulse.value = withRepeat(
        withSequence(withTiming(0.7, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
      );
    } else {
      pulse.value = 1;
    }
  }, [loading, disabled, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: loading && !disabled ? pulse.value : 1,
  }));

  const enabledLayerStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value,
  }));

  const disabledLayerStyle = useAnimatedStyle(() => ({
    opacity: 1 - activeOpacity.value,
  }));

  const handlePress = () => {
    if (disabled || loading) return;
    if (isPrimary || isEsoPay) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  if (isEsoPay) {
    return (
      <MotionPressable
        onPress={handlePress}
        disabled={isDisabled}
        haptic="medium"
        scaleTo={reduced ? 1 : 0.97}
      >
        <Animated.View style={[styles.esopayStack, animStyle]}>
          <Animated.View style={[styles.esopayLayer, disabledLayerStyle]}>
            <View style={styles.esopayDisabled}>
              <Text style={styles.esopayDisabledText}>{label}</Text>
            </View>
          </Animated.View>
          <Animated.View style={[styles.esopayLayer, styles.esopayLayerTop, enabledLayerStyle]}>
            <View style={[styles.esopayActive, goldCta && styles.esopayActiveGold]}>
              {loading ? (
                <ActivityIndicator
                  color={ESOPAY_SIGN_IN.buttonText}
                  size="small"
                />
              ) : (
                <Text style={[styles.esopayActiveText, styles.esopayActiveTextGold]}>
                  {label}
                </Text>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </MotionPressable>
    );
  }

  return (
    <MotionPressable
      onPress={handlePress}
      disabled={isDisabled}
      haptic={isPrimary ? 'medium' : 'light'}
      scaleTo={reduced ? 1 : 0.97}
    >
      <Animated.View style={animStyle}>
        {disabled ? (
          <View style={styles.disabled}>
            <Text style={styles.disabledText}>{label}</Text>
          </View>
        ) : isGhost ? (
          <View style={styles.ghost}>
            {loading ? (
              <ActivityIndicator color={C.OFF_WHITE} size="small" />
            ) : (
              <Text style={styles.ghostText}>{label}</Text>
            )}
          </View>
        ) : isMonitoring ? (
          <View style={styles.monitoring}>
            {loading ? (
              <ActivityIndicator color={MONITORING_AUTH.buttonText} size="small" />
            ) : (
              <Text style={styles.monitoringText}>{label}</Text>
            )}
          </View>
        ) : (
          <View style={styles.primary}>
            {loading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.primaryText}>{label}</Text>
            )}
          </View>
        )}
      </Animated.View>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  primaryText: {
    fontFamily: F.sansMed,
    fontSize: 17,
    color: '#000000',
  },
  monitoring: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monitoringText: {
    fontFamily: F.sansMed,
    fontSize: 17,
    color: MONITORING_AUTH.buttonText,
  },
  disabled: {
    height: 56,
    borderRadius: 14,
    backgroundColor: C.DARK_3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledText: {
    fontFamily: F.sansMed,
    fontSize: 17,
    color: C.OFF_WHITE,
    opacity: 0.25,
  },
  ghost: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontFamily: F.sansMed,
    fontSize: 17,
    color: C.OFF_WHITE,
    opacity: 0.6,
  },
  esopayStack: {
    height: 56,
    position: 'relative',
  },
  esopayLayer: {
    ...StyleSheet.absoluteFill,
  },
  esopayLayerTop: {
    zIndex: 1,
  },
  esopayDisabled: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: ESOPAY_SIGN_IN.surface,
    borderWidth: 1,
    borderColor: ESOPAY_SIGN_IN.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  esopayDisabledText: {
    fontFamily: inter.medium,
    fontSize: 17,
    color: ESOPAY_SIGN_IN.disabledText,
  },
  esopayActive: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: ESOPAY_SIGN_IN.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  esopayActiveGold: {
    backgroundColor: ESOPAY_SIGN_IN.gold,
  },
  esopayActiveText: {
    fontFamily: inter.bold,
    fontSize: 17,
    color: ESOPAY_SIGN_IN.buttonText,
  },
  esopayActiveTextGold: {
    fontFamily: inter.semibold,
    fontSize: 16,
    color: ESOPAY_SIGN_IN.buttonText,
  },
});
