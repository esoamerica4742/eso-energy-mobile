import { View, StyleSheet } from 'react-native';

type Props = {
  x: number;
  y: number;
  color: string;
};

export function ChartEndDot({ x, y, color }: Props) {
  const size = 5;

  return (
    <View
      style={[
        styles.dot,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
  },
});
