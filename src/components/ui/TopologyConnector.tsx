import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Colors } from '@/tokens/design';

type Props = {
  energyFlowing?: boolean;
  /** Stagger start so power appears to cascade along the topology. */
  flowDelayMs?: number;
  style?: StyleProp<ViewStyle>;
};

const FLOW_DURATION_MS = 2200;

export function TopologyConnector({
  energyFlowing = false,
  flowDelayMs = 0,
  style,
}: Props) {
  const flow = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!energyFlowing || width <= 0) {
      flow.setValue(0);
      return;
    }

    let loop: Animated.CompositeAnimation | null = null;
    const startLoop = () => {
      flow.setValue(0);
      loop = Animated.loop(
        Animated.timing(flow, {
          toValue: 1,
          duration: FLOW_DURATION_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
    };

    const delayTimer = setTimeout(startLoop, flowDelayMs);

    return () => {
      clearTimeout(delayTimer);
      loop?.stop();
      flow.setValue(0);
    };
  }, [energyFlowing, flow, flowDelayMs, width]);

  const translateX = flow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, width - 5)],
  });

  const stroke = energyFlowing ? Colors.goldBorderStrong : Colors.borderSubtle;

  return (
    <View
      style={[styles.container, style]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Svg width={width} height={2} style={styles.lineSvg}>
          <Line
            x1={0}
            y1={1}
            x2={width}
            y2={1}
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray={energyFlowing ? '3,5' : '2,8'}
          />
        </Svg>
      ) : null}
      {energyFlowing && width > 0 ? (
        <Animated.View style={[styles.dot, { transform: [{ translateX }] }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 2,
    justifyContent: 'center',
    minWidth: 12,
    position: 'relative',
  },
  lineSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  dot: {
    position: 'absolute',
    top: -2,
    left: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.mint,
  },
});
