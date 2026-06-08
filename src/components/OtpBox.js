import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { C, F } from '../theme/authTheme';

export function OtpBox({ char, focused, filled, error, scale }) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale?.value ?? 1 }],
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        animStyle,
        focused && styles.boxFocused,
        filled && styles.boxFilled,
        error && styles.boxError,
      ]}
    >
      <Text style={styles.boxText}>{char}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 46,
    height: 58,
    borderRadius: 12,
    backgroundColor: C.DARK_2,
    borderWidth: 1.5,
    borderColor: C.DARK_3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: C.GOLD_MID,
    shadowColor: C.GOLD_MID,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  boxFilled: { borderColor: C.DARK_4, backgroundColor: C.DARK_3 },
  boxError: { borderColor: C.ERROR },
  boxText: { fontFamily: F.cormorant, fontSize: 28, color: C.WHITE },
});
