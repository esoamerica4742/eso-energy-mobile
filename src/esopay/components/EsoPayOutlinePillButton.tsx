import { memo } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ESO_PAY_TEXT_PRIMARY, ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

/** Quiet text link — "See all", "View all", etc. */
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
      style={({ pressed }) => [styles.hit, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {({ pressed }) => (
        <Text style={[styles.label, pressed && styles.labelPressed]}>{label}</Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  hit: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    letterSpacing: 0.2,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  labelPressed: {
    color: ESO_PAY_TEXT_PRIMARY,
  },
});
