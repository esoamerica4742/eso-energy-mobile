import { memo } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { luxury } from '@/esopay/theme/luxury';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

/** Small gold-outlined pill — home "See all" / "View all" CTAs. */
export const EsoPayOutlinePillButton = memo(function EsoPayOutlinePillButton({
  label,
  onPress,
  accessibilityLabel,
  style,
}: Props) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.55)',
    backgroundColor: 'rgba(212, 160, 23, 0.08)',
  },
  pillPressed: {
    opacity: 0.88,
    backgroundColor: 'rgba(212, 160, 23, 0.14)',
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 0.35,
    color: luxury.warmWhite,
  },
});
