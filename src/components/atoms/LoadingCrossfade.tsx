import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type Props = {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
};

/** Skeleton overlay — children stay mounted for stale-while-revalidate (no remount jank). */
export function LoadingCrossfade({ loading, skeleton, children, style }: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <View style={[styles.root, style]}>
        {children}
        {loading ? <View style={styles.overlayStatic}>{skeleton}</View> : null}
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <View style={styles.content}>{children}</View>
      {loading ? (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(220)} style={styles.overlay}>
          {skeleton}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill },
  overlayStatic: { ...StyleSheet.absoluteFill },
});
