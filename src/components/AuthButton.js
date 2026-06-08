import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MotionPressable } from '@/lib/motion';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { C, F } from '../theme/authTheme';

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

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

  const handlePress = () => {
    if (disabled || loading) return;
    if (variant === 'primary') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const isGhost = variant === 'ghost';

  return (
    <MotionPressable
      onPress={handlePress}
      disabled={disabled || loading}
      haptic={variant === 'primary' ? 'medium' : 'light'}
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
        ) : (
          <LinearGradient
            colors={[C.GOLD_DARK, C.GOLD_MID, C.GOLD_LIGHT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primary}
          >
            {loading ? (
              <ActivityIndicator color={C.DARK_1} size="small" />
            ) : (
              <Text style={styles.primaryText}>{label}</Text>
            )}
          </LinearGradient>
        )}
      </Animated.View>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.GOLD_MID,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryText: {
    fontFamily: F.sansMed,
    fontSize: 17,
    color: C.DARK_1,
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
});
