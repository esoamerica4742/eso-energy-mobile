import { memo } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { ESO_PAY_GOLD, ESO_PAY_TEXT_PRIMARY } from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';

type Props = {
  children: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
};

/** Section heading — 3px gold accent + bold 16px. */
export const EsoPaySectionLabel = memo(function EsoPaySectionLabel({
  children,
  style,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.row, containerStyle]}>
      <View style={styles.accent} />
      <Text style={[styles.label, style]} numberOfLines={2}>
        {children}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.space.inline,
    flexShrink: 1,
  },
  accent: {
    width: ds.size.sectionAccent,
    height: 16,
    borderRadius: 2,
    backgroundColor: ESO_PAY_GOLD,
  },
  label: {
    fontFamily: ds.font.title,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
    flexShrink: 1,
    textTransform: 'none',
  },
});
