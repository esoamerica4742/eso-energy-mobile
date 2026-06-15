import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyRound } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { HOME_CARD_BORDER, HOME_CARD_SURFACE } from '@/esopay/theme/brandColors';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { goldRgba } from '@/theme/colors';

const PRESS_SPRING = { damping: 18, stiffness: 300 };

type Props = {
  pinConfigured: boolean;
  loading?: boolean;
  onPress: () => void;
};

export function EsoPayPinSetupCard({ pinConfigured, loading, onPress }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, PRESS_SPRING);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1.0, PRESS_SPRING);
  }, [scale]);

  if (pinConfigured || loading) return null;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel="Set up transaction PIN"
    >
      <Animated.View style={[styles.card, animStyle]}>
        <View style={styles.iconWrap}>
          <KeyRound size={20} color={colors.gold} strokeWidth={2} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Set up your transaction PIN</Text>
          <Text style={styles.body}>
            Required before your first payment. Your 4-digit PIN unlocks the app and secures every transaction.
          </Text>
          <Text style={styles.cta}>Set up now →</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: 4,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: HOME_CARD_SURFACE,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: goldRgba(0.12),
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  cta: {
    marginTop: 6,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.gold,
  },
});
