import { memo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

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
      <MotiView
        from={{ translateX: -120 }}
        animate={{ translateX: 200 }}
        transition={{ type: 'timing', duration: 1200, loop: true }}
        style={styles.shimmer}
      />
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
    backgroundColor: colors.surface2,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(212, 160, 23, 0.14)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.lg,
  },
});
