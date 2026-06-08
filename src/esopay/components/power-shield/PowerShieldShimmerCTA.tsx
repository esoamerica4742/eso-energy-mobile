import { memo, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PowerShieldShimmerCTA = memo(function PowerShieldShimmerCTA({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
}: Props) {
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    if (disabled || loading) {
      shimmerX.value = -1;
      return;
    }
    shimmerX.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [disabled, loading, shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value * 280 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, disabled && styles.btnDisabled, style]}
      accessibilityRole="button"
    >
      {!disabled && !loading ? (
        <Animated.View style={[styles.shimmerTrack, shimmerStyle]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGrad}
          />
        </Animated.View>
      ) : null}
      {loading ? (
        <ActivityIndicator color="#1A1200" size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: PS.amber,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnDisabled: {
    opacity: 0.65,
  },
  shimmerTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    left: -60,
  },
  shimmerGrad: {
    flex: 1,
    width: 120,
  },
  label: {
    fontFamily: psFont.bodyBold,
    fontSize: 16,
    color: '#1A1200',
    letterSpacing: 0.2,
  },
});
