import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { EsoPayTokens as T, esopayStatusColor, type EsoPayStatusKey } from '@/esopay/theme/tokens';

type Props = {
  status: EsoPayStatusKey;
  size?: number;
};

export const LiveStatusDot = memo(function LiveStatusDot({ status, size = 8 }: Props) {
  const pulse = useSharedValue(1);
  const shouldPulse = status === 'live' || status === 'partial';

  useEffect(() => {
    if (!shouldPulse) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(0.4, {
          duration: T.animation.pulsePeriodMs / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1, {
          duration: T.animation.pulsePeriodMs / 2,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
  }, [pulse, shouldPulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: shouldPulse ? pulse.value : 1,
  }));

  const color = esopayStatusColor(status);

  return (
    <View style={[styles.wrap, { width: size + 6, height: size + 6 }]}>
      {shouldPulse ? (
        <View
          style={[
            styles.halo,
            {
              width: size + 6,
              height: size + 6,
              borderRadius: (size + 6) / 2,
              backgroundColor: `${color}22`,
            },
          ]}
        />
      ) : null}
      <Animated.View
        style={[
          styles.dot,
          dotStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  dot: {
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
  },
});
