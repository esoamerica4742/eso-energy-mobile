import { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { C } from './tokens';
import { T } from './stripeType';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CHART_W = 320;
const CHART_H = 100;
const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;
const LINE_LEN = 1200;

function powerSeries() {
  return Array.from({ length: 20 }, (_, i) => {
    const x = i / 19;
    const y =
      0.3 + 0.4 * Math.sin(i * 0.8) + 0.15 * Math.sin(i * 2.1) + 0.05 * Math.cos(i * 1.3);
    return { x, y };
  });
}

function seriesToPath(points: { x: number; y: number }[]) {
  const coords = points.map((p) => ({
    px: p.x * CHART_W,
    py: CHART_H - 8 - p.y * (CHART_H - 16),
  }));
  let d = `M ${coords[0].px} ${coords[0].py}`;
  for (let i = 1; i < coords.length; i += 1) {
    const prev = coords[i - 1];
    const cur = coords[i];
    const cx = (prev.px + cur.px) / 2;
    d += ` Q ${cx} ${prev.py} ${cur.px} ${cur.py}`;
  }
  return { line: d, coords };
}

export function EfficiencyRing({ active }: { active: boolean }) {
  const offset = useSharedValue(RING_C);
  const pct = 0.398;

  useEffect(() => {
    if (!active) return;
    offset.value = withTiming(RING_C * (1 - pct), {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, offset]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      <Circle cx={40} cy={40} r={RING_R} stroke={C.glassBorder} strokeWidth={6} fill="none" />
      <AnimatedCircle
        cx={40}
        cy={40}
        r={RING_R}
        stroke={C.teal}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${RING_C} ${RING_C}`}
        animatedProps={arcProps}
        transform="rotate(-90 40 40)"
      />
      <SvgText x={40} y={45} fill={C.text} fontSize={18} textAnchor="middle">
        39.8%
      </SvgText>
    </Svg>
  );
}

export function InverterAreaChart({ active }: { active: boolean }) {
  const points = useMemo(() => powerSeries(), []);
  const { line, coords } = useMemo(() => seriesToPath(points), [points]);
  const area = `${line} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`;
  const dash = useSharedValue(LINE_LEN);

  useEffect(() => {
    if (!active) return;
    dash.value = LINE_LEN;
    dash.value = withTiming(0, { duration: 2000, easing: Easing.out(Easing.cubic) });
  }, [active, dash]);

  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: dash.value,
  }));

  const peaks = coords.filter((_, i) => i % 4 === 2).slice(0, 5);

  return (
    <View className="mt-5 w-full">
      <Svg
        width="100%"
        height={CHART_H}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.teal} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={C.teal} stopOpacity={0} />
          </SvgGradient>
        </Defs>
        <Path d={area} fill="url(#chartFill)" />
        <AnimatedPath
          d={line}
          fill="none"
          stroke={C.teal}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={LINE_LEN}
          animatedProps={strokeProps}
        />
        {peaks.map((p, i) => (
          <Circle key={i} cx={p.px} cy={p.py} r={3} fill={C.teal} opacity={0.85} />
        ))}
      </Svg>
      <View className="mt-1.5 flex-row justify-between">
        {['6AM', '9AM', '12PM', '3PM', '6PM'].map((t) => (
          <Text key={t} style={[T.caption, { fontSize: 12 }]}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function TokenProgressBar({ active }: { active: boolean }) {
  const pct = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    pct.value = withTiming(0.65, { duration: 1500, easing: Easing.out(Easing.cubic) });
  }, [active, pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${pct.value * 100}%`,
  }));

  return (
    <View
      className="mt-4 h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: C.glassBorder }}
    >
      <Animated.View
        style={[
          fillStyle,
          {
            height: '100%',
            borderRadius: C.radiusPill,
            backgroundColor: C.amber,
          },
        ]}
      />
    </View>
  );
}
