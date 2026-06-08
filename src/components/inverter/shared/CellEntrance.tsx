import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, type ViewProps } from 'react-native';

type Props = ViewProps & {
  children: ReactNode;
  delay?: number;
};

export function CellEntrance({ children, delay = 0, style, ...rest }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[{ flex: 1, opacity, transform: [{ translateY }] }, style]} {...rest}>
      {children}
    </Animated.View>
  );
}
