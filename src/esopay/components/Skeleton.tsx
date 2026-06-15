import { memo, useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

function Shimmer() {
  const translateX = useSharedValue(-120);

  useEffect(() => {
    translateX.value = withRepeat(withTiming(200, { duration: 1200 }), -1, false);
  }, [translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={[styles.shimmer, shimmerStyle]} />;
}

/** Gold shimmer skeleton block (spec global loading). */
export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.base,
        { width, height, borderRadius, overflow: 'hidden' },
        style,
      ]}
    >
      <Shimmer />
    </View>
  );
});

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={12} width="40%" />
      <Skeleton height={28} width="70%" style={{ marginTop: spacing.md }} />
      <Skeleton height={14} width="90%" style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 96,
    backgroundColor: 'rgba(232,160,32,0.1)',
  },
  card: {
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
