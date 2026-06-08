import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Radius } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';
import { useLiveDotPulse } from '@/hooks/useCountUp';

type Props = {
  label?: string;
};

export function LiveBadge({ label = 'LIVE' }: Props) {
  const pulse = useLiveDotPulse(true);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.dot, { opacity: pulse }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.mintGlow,
    borderWidth: 1,
    borderColor: Colors.mintBorderStrong,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.mint,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.mint,
    letterSpacing: 2,
  },
});
