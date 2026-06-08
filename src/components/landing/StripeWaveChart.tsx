import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { stripe } from './stripeTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const WIDTH = 320;
const HEIGHT = 56;
const BASELINE = HEIGHT * 0.58;
const PATH_LENGTH = 480;

function buildWavePath(): string {
  const segments = 28;
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i += 1) {
    const x = (i / segments) * WIDTH;
    const t = (i / segments) * Math.PI * 4;
    const y =
      BASELINE + Math.sin(t) * 11 + Math.sin(t * 2.1 + 0.3) * 5 + Math.cos(t * 0.65) * 5;
    points.push([x, y]);
  }
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    d += ` Q ${cx} ${py} ${x} ${y}`;
  }
  return d;
}

function buildAreaPath(linePath: string): string {
  return `${linePath} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
}

type Props = {
  animate?: boolean;
};

export function StripeWaveChart({ animate = true }: Props) {
  const linePath = useMemo(() => buildWavePath(), []);
  const areaPath = useMemo(() => buildAreaPath(linePath), [linePath]);
  const dashOffset = useSharedValue(PATH_LENGTH);

  useEffect(() => {
    if (!animate) {
      dashOffset.value = 0;
      return;
    }
    dashOffset.value = PATH_LENGTH;
    dashOffset.value = withDelay(
      400,
      withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) }),
    );
  }, [animate, dashOffset]);

  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <View className="mt-4 w-full overflow-hidden">
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={stripe.teal} stopOpacity={0.28} />
            <Stop offset="100%" stopColor={stripe.teal} stopOpacity={0.02} />
          </SvgGradient>
          <SvgGradient id="waveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={stripe.teal} stopOpacity={0.35} />
            <Stop offset="50%" stopColor={stripe.teal} stopOpacity={1} />
            <Stop offset="100%" stopColor={stripe.teal} stopOpacity={0.45} />
          </SvgGradient>
        </Defs>
        <Path d={areaPath} fill="url(#waveFill)" />
        <AnimatedPath
          animatedProps={strokeProps}
          d={linePath}
          fill="none"
          stroke="url(#waveStroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={PATH_LENGTH}
        />
      </Svg>
    </View>
  );
}
