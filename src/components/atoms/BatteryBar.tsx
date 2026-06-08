import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fontSize, fonts, spacing } from '@/theme/tokens';

export function BatteryBar({ percent }: { percent: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(Math.min(100, Math.max(0, percent)), {
      damping: 22,
      stiffness: 100,
    });
  }, [percent, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const hoursLeft = Math.max(1, Math.round((percent / 100) * 5.6));

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]}>
          <LinearGradient
            colors={['#34D399', '#10B981']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
      <Text style={styles.label}>{`${Math.round(percent)}%`}</Text>
      <Text style={styles.eta}>{`~${hoursLeft}h left`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  fill: { height: '100%', borderRadius: 50, overflow: 'hidden' },
  gradient: { width: '100%', height: '100%' },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.label,
    color: colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  eta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    minWidth: 42,
    textAlign: 'right',
  },
});
