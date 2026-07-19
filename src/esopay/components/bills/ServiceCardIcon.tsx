import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: ReactNode;
};

/** Quiet icon plate for Eso Pay service cards — no gold halo. */
export const ServiceCardIcon = memo(function ServiceCardIcon({ children }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.topSheen} pointerEvents="none" />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 11,
    padding: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
});
