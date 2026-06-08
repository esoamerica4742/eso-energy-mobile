import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { Colors } from '@/tokens/design';

type Props = {
  active?: boolean;
};

/** Ultra-soft control-room atmosphere — does not alter layout or chrome. */
export const AmbientControlAtmosphere = memo(function AmbientControlAtmosphere({
  active = true,
}: Props) {
  const reduced = useReducedMotion();
  if (!active || reduced) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={['rgba(77,159,255,0.04)', 'transparent', 'rgba(212,175,90,0.03)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.45 }}
      />
      <View style={styles.gridOverlay} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.025,
    backgroundColor: Colors.borderSubtle,
  },
});
