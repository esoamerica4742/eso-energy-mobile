import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: ReactNode | ((revealed: boolean) => ReactNode);
  scrollY: number;
  viewportH: number;
  onReveal?: () => void;
};

export function RevealSection({ children, scrollY, viewportH, onReveal }: Props) {
  const [revealed, setRevealed] = useState(false);
  const layoutY = useRef(0);
  const layoutH = useRef(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(32);

  const onLayout = (e: LayoutChangeEvent) => {
    layoutY.current = e.nativeEvent.layout.y;
    layoutH.current = e.nativeEvent.layout.height;
  };

  useEffect(() => {
    if (revealed) return;
    const threshold = layoutY.current + layoutH.current * 0.15;
    if (scrollY + viewportH > threshold) {
      setRevealed(true);
      onReveal?.();
      opacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    }
  }, [scrollY, viewportH, revealed, onReveal, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View onLayout={onLayout}>
      <Animated.View style={style}>
        {typeof children === 'function' ? children(revealed) : children}
      </Animated.View>
    </View>
  );
}
