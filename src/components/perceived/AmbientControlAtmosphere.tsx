import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

type Props = {
  active?: boolean;
};

/** Near-invisible white wash — no blue/gold cast. */
export const AmbientControlAtmosphere = memo(function AmbientControlAtmosphere({
  active = true,
}: Props) {
  const reduced = useReducedMotion();
  if (!active || reduced) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={['rgba(255,255,255,0.02)', 'transparent', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
});
