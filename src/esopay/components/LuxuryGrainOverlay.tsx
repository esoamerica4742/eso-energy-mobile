import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

/** Subtle vignette — SVG noise filters are unreliable on native and can blank siblings. */
export const LuxuryGrainOverlay = memo(function LuxuryGrainOverlay() {
  return <View style={styles.wrap} pointerEvents="none" />;
});

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        // Soft edge darkening without SVG filters
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 48,
      },
      default: {},
    }),
  },
});
