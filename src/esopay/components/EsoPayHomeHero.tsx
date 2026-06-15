import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ESO_PAY_TEXT_PRIMARY } from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';

type Props = {
  greeting: string;
};

export const EsoPayHomeHero = memo(function EsoPayHomeHero({ greeting }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.greeting} accessibilityRole="header">
        {greeting}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    paddingBottom: 0,
    zIndex: 2,
    alignSelf: 'stretch',
  },
  greeting: {
    fontFamily: inter.bold,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: -0.35,
    textAlign: 'left',
  },
});
