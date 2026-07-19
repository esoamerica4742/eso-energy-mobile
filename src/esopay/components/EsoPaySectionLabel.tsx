import { memo } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { ESO_PAY_TEXT_PRIMARY } from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';

type Props = {
  children: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
};

/** Home-matched section title — 15px quiet. */
export const EsoPaySectionLabel = memo(function EsoPaySectionLabel({
  children,
  style,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.row, containerStyle]}>
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
    flexShrink: 1,
  },
  label: {
    fontFamily: inter.semibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
    flexShrink: 1,
  },
});
