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
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ds } from '@/esopay/theme/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BaseProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Gold primary — default CTAs. */
export const EsoPayPrimaryButton = memo(function EsoPayPrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: BaseProps) {
  const active = !disabled && !loading;
  const opacity = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration: ds.motion.duration });
  }, [active, opacity]);

  const enabledStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const disabledStyle = useAnimatedStyle(() => ({ opacity: 1 - opacity.value }));

  return (
    <AnimatedPressable
      onPress={() => {
        if (!active) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      disabled={!active}
      style={[styles.stack, style]}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.layer, disabledStyle]}>
        <View style={styles.primaryDisabled}>
          <Text style={styles.primaryDisabledText}>{label}</Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.layer, styles.layerTop, enabledStyle]}>
        <View style={styles.primaryActive}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryActiveText}>{label}</Text>
          )}
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
});

/** Flat gold — Add Funds & Activate Power Shield only. */
export const EsoPayGoldButton = memo(function EsoPayGoldButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  active = false,
  style,
}: BaseProps & { active?: boolean }) {
  const canPress = !disabled && !loading;

  if (active) {
    return (
      <Pressable
        onPress={() => {
          if (!canPress) return;
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        disabled={!canPress}
        style={[styles.goldActiveState, style]}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color={ds.color.gold} />
        ) : (
          <Text style={styles.goldActiveStateText}>{label}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => {
        if (!canPress) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onPress();
      }}
      disabled={!canPress}
      style={[styles.goldBtn, disabled && styles.goldBtnDisabled, style]}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={ds.color.bg} />
      ) : (
        <Text style={styles.goldBtnText}>{label}</Text>
      )}
    </Pressable>
  );
});

/** Ghost outline button. */
export const EsoPayGhostButton = memo(function EsoPayGhostButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: BaseProps) {
  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        void Haptics.selectionAsync();
        onPress();
      }}
      disabled={disabled || loading}
      style={[styles.ghost, style]}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={ds.color.textPrimary} />
      ) : (
        <Text style={styles.ghostText}>{label}</Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  stack: {
    height: ds.size.buttonHeight,
    position: 'relative',
  },
  layer: {
    ...StyleSheet.absoluteFill,
  },
  layerTop: {
    zIndex: 1,
  },
  primaryDisabled: {
    flex: 1,
    borderRadius: ds.radius.input,
    backgroundColor: ds.color.surface1,
    borderWidth: 1,
    borderColor: ds.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabledText: {
    fontFamily: ds.font.button,
    fontSize: ds.type.button.fontSize,
    color: ds.color.textDisabled,
  },
  primaryActive: {
    flex: 1,
    borderRadius: ds.radius.input,
    backgroundColor: ds.color.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActiveText: {
    fontFamily: ds.font.button,
    fontSize: ds.type.button.fontSize,
    color: '#FFFFFF',
  },
  goldBtn: {
    width: '100%',
    height: ds.size.buttonHeight,
    borderRadius: ds.radius.input,
    backgroundColor: ds.color.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBtnDisabled: {
    opacity: 0.55,
  },
  goldBtnText: {
    fontFamily: ds.font.button,
    fontSize: ds.type.button.fontSize,
    fontWeight: '700',
    color: ds.color.bg,
  },
  goldActiveState: {
    width: '100%',
    height: ds.size.buttonHeight,
    borderRadius: ds.radius.input,
    backgroundColor: ds.color.goldMuted12,
    borderWidth: 1,
    borderColor: ds.color.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldActiveStateText: {
    fontFamily: ds.font.button,
    fontSize: ds.type.button.fontSize,
    color: ds.color.gold,
    fontWeight: '700',
  },
  ghost: {
    width: '100%',
    height: ds.size.ghostHeight,
    borderRadius: ds.radius.input,
    borderWidth: 1,
    borderColor: ds.color.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontFamily: ds.font.bodyStrong,
    fontSize: ds.type.body.fontSize,
    color: ds.color.textPrimary,
  },
});
