import { memo, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import {
  ESO_PAY_BG,
  ESO_PAY_TEXT_PRIMARY,
} from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';
import { useButtonPressAnimation } from '@/lib/motion/springMotion';

type Props = {
  label: string;
  onPress?: () => void;
  primary?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
};

/** Revolut-style soft pill CTA — white primary, muted secondary. */
export const SoftCta = memo(function SoftCta({
  label,
  onPress,
  primary = true,
  loading = false,
  disabled = false,
  icon,
  style,
}: Props) {
  const { style: btnStyle, onPressIn, onPressOut } = useButtonPressAnimation();
  const blocked = disabled || loading || !onPress;

  return (
    <Pressable
      onPress={() => {
        if (blocked) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      onPressIn={() => {
        if (blocked) return;
        onPressIn();
      }}
      onPressOut={() => {
        if (blocked) return;
        onPressOut();
      }}
      disabled={blocked}
      style={[styles.hit, blocked && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
    >
      <Animated.View
        style={[styles.pill, primary ? styles.primary : styles.secondary, btnStyle]}
      >
        {loading ? (
          <ActivityIndicator color={primary ? ESO_PAY_BG : ESO_PAY_TEXT_PRIMARY} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, primary ? styles.labelPrimary : styles.labelSecondary]}>
              {label}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  hit: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: ESO_PAY_TEXT_PRIMARY,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontFamily: inter.semibold,
    fontSize: 15,
    fontWeight: '600',
  },
  labelPrimary: {
    color: ESO_PAY_BG,
  },
  labelSecondary: {
    color: ESO_PAY_TEXT_PRIMARY,
  },
});
