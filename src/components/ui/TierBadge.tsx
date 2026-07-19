import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';

type Props = {
  tier: string;
};

export function TierBadge({ tier }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text} numberOfLines={1}>
        {tier}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  text: {
    color: Colors.goldMuted,
    fontSize: 9,
    letterSpacing: 2.5,
    fontFamily: Fonts.regular,
    textTransform: 'uppercase',
  },
});
