import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { SkeletonChart } from '@/components/atoms/Skeleton';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const TEAL = '#00F5D4';
const WIDTH = 320;
const HEIGHT = 52;
const BASELINE = HEIGHT * 0.52;

function buildWavePath(phase: number): string {
  'worklet';
  const points: Array<[number, number]> = [];
  const segments = 24;
  for (let i = 0; i <= segments; i += 1) {
    const x = (i / segments) * WIDTH;
    const t = (i / segments) * Math.PI * 4 + phase;
    const y =
      BASELINE + Math.sin(t) * 10 + Math.sin(t * 2.3 + 0.4) * 4 + Math.cos(t * 0.7) * 6;
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

function buildSeriesPath(values: number[]): string {
  if (values.length < 2) return buildWavePath(0);

  const max = Math.max(...values, 0.01);
  const min = Math.min(...values);
  const span = Math.max(max - min, 0.01);

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * WIDTH;
    const norm = (v - min) / span;
    const y = HEIGHT - 6 - norm * (HEIGHT - 12);
    return [x, y] as [number, number];
  });

  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    d += ` Q ${cx} ${py} ${x} ${y}`;
  }
  return d;
}

type Props = {
  values: number[];
  loading?: boolean;
  animateFallback?: boolean;
};

export function PowerPulseChart({ values, loading, animateFallback = true }: Props) {
  const phase = useSharedValue(0);
  const seriesPath = useMemo(() => buildSeriesPath(values), [values]);
  const useLiveSeries = values.length >= 2;

  useEffect(() => {
    if (useLiveSeries || !animateFallback) return;
    phase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
      -1,
    );
  }, [phase, useLiveSeries, animateFallback]);

  const animatedProps = useAnimatedProps(() => ({
    d: useLiveSeries ? seriesPath : buildWavePath(phase.value),
  }));

  if (loading) {
    return (
      <View className="mt-4">
        <SkeletonChart height={52} />
      </View>
    );
  }

  const staticPath = useLiveSeries ? seriesPath : buildWavePath(0);

  return (
    <View className="mt-4 w-full overflow-hidden">
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="pulseStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={TEAL} stopOpacity={0.45} />
            <Stop offset="50%" stopColor={TEAL} stopOpacity={1} />
            <Stop offset="100%" stopColor={TEAL} stopOpacity={0.5} />
          </SvgGradient>
        </Defs>
        {useLiveSeries ? (
          <Path
            d={staticPath}
            fill="none"
            stroke="url(#pulseStroke)"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <AnimatedPath
            animatedProps={animatedProps}
            fill="none"
            stroke="url(#pulseStroke)"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={staticPath}
          />
        )}
      </Svg>
    </View>
  );
}
