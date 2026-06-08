import { memo, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Lock } from 'lucide-react-native';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  style?: ViewStyle;
};

const SHIMMER_WIDTH = 120;

export const GoldCTAButton = memo(function GoldCTAButton({
  label,
  onPress,
  isLoading = false,
  isDisabled = false,
  style,
}: Props) {
  const shimmerX = useSharedValue(-SHIMMER_WIDTH);
  const inactive = isLoading || isDisabled;

  useEffect(() => {
    if (inactive) {
      cancelAnimation(shimmerX);
      shimmerX.value = -SHIMMER_WIDTH;
      return;
    }

    shimmerX.value = withRepeat(
      withTiming(360, {
        duration: T.animation.shimmerDurationMs,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [inactive, shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }, { rotate: '18deg' }],
  }));

  const handlePress = useCallback(() => {
    if (inactive) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [inactive, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        inactive ? styles.buttonDisabled : styles.buttonActive,
        pressed && !inactive && styles.buttonPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: isLoading }}
    >
      {!inactive ? (
        <LinearGradient
          colors={['#8E6F12', T.color.gold.primary, '#F2D37A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {!inactive ? (
        <Animated.View pointerEvents="none" style={[styles.shimmerWrap, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmer}
          />
        </Animated.View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={T.color.bg.void} />
      ) : (
        <>
          {isDisabled ? (
            <View style={styles.lockIcon}>
              <Lock size={16} color={T.color.bg.void} strokeWidth={2.2} />
            </View>
          ) : null}
          <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 52,
    borderRadius: T.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
  },
  buttonActive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.10)',
    ...T.shadow.inputFocus,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  shimmerWrap: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: SHIMMER_WIDTH,
  },
  shimmer: {
    flex: 1,
  },
  label: {
    fontFamily: esopayFonts.heading,
    fontSize: T.type.h3.size,
    lineHeight: T.type.h3.lineHeight,
    color: T.color.bg.void,
    letterSpacing: 0.25,
  },
  labelDisabled: {
    opacity: 0.85,
  },
  lockIcon: {
    marginRight: T.spacing.sm,
  },
});
