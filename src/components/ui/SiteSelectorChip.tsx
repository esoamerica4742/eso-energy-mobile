import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';

type Props = {
  siteName: string;
  onPress?: () => void;
};

export function SiteSelectorChip({ siteName, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Selected site ${siteName}`}
      accessibilityHint="Opens site selector"
    >
      <Text style={styles.text} numberOfLines={1}>
        {siteName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    maxWidth: 220,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    color: Colors.goldSoft,
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
});
