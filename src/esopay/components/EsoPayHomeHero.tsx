import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';

type Props = {
  greeting: string;
};

export const EsoPayHomeHero = memo(function EsoPayHomeHero({ greeting }: Props) {
  return (
    <View style={styles.root}>
      <Text
        style={styles.greeting}
        accessibilityRole="header"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
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
    fontFamily: inter.medium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: ESO_PAY_TEXT_SECONDARY,
    letterSpacing: -0.1,
    textAlign: 'left',
    flexShrink: 1,
  },
});
