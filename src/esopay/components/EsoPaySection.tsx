import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';

type Props = {
  title: string;
  children?: ReactNode;
};
export const EsoPaySection = memo(function EsoPaySection({ title, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: T.spacing.xxl,
  },
  title: {
    fontFamily: esopayFonts.heading,
    fontSize: T.type.h2.size,
    lineHeight: T.type.h2.lineHeight,
    color: T.color.text.primary,
    marginBottom: T.spacing.md,
  },
});
