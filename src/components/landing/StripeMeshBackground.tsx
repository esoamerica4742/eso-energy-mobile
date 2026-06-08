import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type BlobConfig = {
  color: string;
  size: number;
  style: ViewStyle;
  duration: number;
};

const BLOBS: BlobConfig[] = [
  { color: 'rgba(99,91,255,0.42)', size: 280, style: { top: -40, left: -70 }, duration: 10000 },
  { color: 'rgba(0,115,230,0.28)', size: 240, style: { top: 80, right: -80 }, duration: 12000 },
  { color: 'rgba(0,200,150,0.32)', size: 220, style: { top: 260, left: 20 }, duration: 9000 },
  { color: 'rgba(147,112,219,0.22)', size: 200, style: { top: 420, right: 10 }, duration: 11000 },
];

function MeshBlob({ color, size, style, duration }: BlobConfig) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, duration]);

  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: (drift.value - 0.5) * 28 },
      { translateY: (drift.value - 0.5) * 22 },
      { scale: 0.92 + drift.value * 0.16 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.blob,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animated,
      ]}
    />
  );
}

export function StripeMeshBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BLOBS.map((b, i) => (
        <MeshBlob key={i} {...b} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
});
