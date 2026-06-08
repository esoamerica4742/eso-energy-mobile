import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  Activity,
  BarChart2,
  MapPin,
  Plug,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { formatCount, runCountUp } from './luxury/animateCount';
import { RevealSection } from './luxury/RevealSection';
import { C, F } from './luxury/tokens';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

const TRUST_LOGOS = [
  'DANGOTE GROUP',
  'MTN BUSINESS',
  'TOTAL ENERGIES',
  'ZENITH BANK',
  'JULIUS BERGER',
];

const STATS = [
  { target: 1.2, suffix: ' GWh', decimals: 1, label: 'TOTAL GENERATED', accent: C.teal, Icon: Zap, ghost: '01' },
  { target: 99.4, suffix: '%', decimals: 1, label: 'PLATFORM UPTIME', accent: C.amber, Icon: TrendingUp, ghost: '02' },
  { target: 12, suffix: '', decimals: 0, label: 'COUNTRIES ACTIVE', accent: C.green, Icon: MapPin, ghost: '03' },
] as const;

const STEPS = [
  {
    n: '01',
    accent: C.teal,
    Icon: Plug,
    title: 'Connect your assets',
    body: 'Link your inverters, solar arrays, and generators in minutes. No hardware changes needed.',
  },
  {
    n: '02',
    accent: C.amber,
    Icon: Activity,
    title: 'ESO orchestrates in real-time',
    body: 'Our AI monitors, balances, and optimizes your entire energy stack — 24/7, automatically.',
  },
  {
    n: '03',
    accent: C.green,
    Icon: BarChart2,
    title: 'Cut costs. Prevent downtime.',
    body: 'Get full visibility, reduce generator runtime by up to 60%, and never lose power again.',
  },
] as const;

/* ─── Primitives ─── */

function MountFade({ delay, children }: { delay: number; children: ReactNode }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(32);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) }));
    y.value = withDelay(delay, withTiming(0, { duration: 550, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

function PingDot() {
  const scale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(2.8, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
    );
    pingOpacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 1500 }), withTiming(0.8, { duration: 0 })),
      -1,
    );
  }, [scale, pingOpacity]);

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pingOpacity.value,
  }));

  return (
    <View className="relative mr-2 h-2 w-2">
      <Animated.View
        style={[
          pingStyle,
          { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: C.teal },
        ]}
      />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.teal }} />
    </View>
  );
}

function GlassCard({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <View
      style={[
        {
          backgroundColor: C.glass,
          borderWidth: 1,
          borderColor: C.glassBorder,
          borderRadius: C.radius,
          padding: C.padH,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: C.glassShine,
        }}
      />
      {children}
    </View>
  );
}

function ShimmerButton({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}) {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    if (variant !== 'primary') return;
    shimmer.value = withRepeat(withTiming(1, { duration: 3500, easing: Easing.linear }), -1);
  }, [shimmer, variant]);

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmer.value * 220 }] }));

  const pressIn = () => {
    scale.value = withTiming(variant === 'primary' ? 0.97 : 0.98, { duration: 100 });
  };
  const pressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  if (variant === 'outline') {
    return (
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} className="w-full">
        <Animated.View
          style={[
            btnStyle,
            {
              minHeight: 52,
              borderRadius: C.radiusPill,
              borderWidth: 1,
              borderColor: C.glassBorder,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ fontFamily: F.monoMed, fontSize: 14, color: C.text, letterSpacing: 0.5 }}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} className="w-full">
      <Animated.View style={btnStyle}>
        <LinearGradient
          colors={[C.teal, '#00C4A8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: 58,
            borderRadius: C.radiusPill,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            shadowColor: C.teal,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              shimmerStyle,
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 100,
                backgroundColor: 'rgba(255,255,255,0.22)',
              },
            ]}
          />
          <Text
            style={{
              fontFamily: F.monoMed,
              fontSize: 15,
              letterSpacing: 1,
              color: C.bg,
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function CountUpStat({
  target,
  suffix,
  decimals,
  active,
  color,
}: {
  target: number;
  suffix: string;
  decimals: number;
  active: boolean;
  color: string;
}) {
  const [text, setText] = useState(formatCount(0, decimals));

  useEffect(() => {
    if (!active) return;
    runCountUp(target, 2000, decimals, (v) => setText(formatCount(v, decimals)));
  }, [active, target, decimals]);

  return (
    <Text style={{ fontFamily: F.bebas, fontSize: 52, lineHeight: 52, color }}>
      {text}
      {suffix}
    </Text>
  );
}

function FloatingChip() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View
      style={[
        style,
        {
          alignSelf: 'center',
          marginTop: 24,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: C.radiusPill,
          backgroundColor: C.glass,
          borderWidth: 1,
          borderColor: C.glassBorder,
        },
      ]}
    >
      <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted2 }}>
        ✓  40+ enterprises trust ESO
      </Text>
    </Animated.View>
  );
}

function DotGrid() {
  const cols = Math.ceil(SCREEN_W / 24);
  const rows = 12;
  const dots = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: c * 24 + 1,
            top: r * 24 + 1,
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.35)',
          }}
        />,
      );
    }
  }
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.06 }}>
      {dots}
    </View>
  );
}

/* ─── Main landing (mobile only) ─── */

export function LandingCommandDeck() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [scrollY, setScrollY] = useState(0);
  const viewportH = SCREEN_H;

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  }, []);

  const goDemo = () => router.push('/login');
  const scrollToMetrics = () => {
    /* scroll handled by user — metrics section follows hero */
  };

  const pageWidth = Math.min(SCREEN_W, C.maxW);

  return (
    <View
      style={{
        flex: 1,
        width: pageWidth,
        maxWidth: C.maxW,
        alignSelf: 'center',
        backgroundColor: C.bg,
        overflow: 'hidden',
      }}
    >
      <StatusBar style="light" />

      {/* Grain overlay */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: 0.03,
          zIndex: 50,
          backgroundColor: 'transparent',
        }}
      />

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        bounces
      >
        {/* §1 Nav */}
        <View
          style={{
            backgroundColor: 'rgba(7,11,20,0.85)',
            borderBottomWidth: 1,
            borderBottomColor: C.glassBorder,
            paddingHorizontal: C.padH,
            paddingVertical: 14,
            minHeight: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <View className="flex-row items-center">
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: C.teal,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: F.syne, fontSize: 16, color: C.bg }}>E</Text>
            </View>
            <Text
              style={{
                marginLeft: 10,
                fontFamily: F.syne,
                fontSize: 15,
                color: C.text,
                letterSpacing: 0.5,
              }}
            >
              ESO ENERGY
            </Text>
          </View>
        </View>

        {/* §2 Hero */}
        <View
          style={{
            minHeight: SCREEN_H * 0.88,
            paddingHorizontal: C.padH,
            paddingTop: 60,
            paddingBottom: 48,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: C.bg,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: '70%',
              height: '50%',
              top: '8%',
              left: '-5%',
              backgroundColor: C.tealGlow,
              borderRadius: 999,
              opacity: 0.55,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: '65%',
              height: '45%',
              bottom: '5%',
              right: '-10%',
              backgroundColor: C.amberGlow,
              borderRadius: 999,
              opacity: 0.5,
            }}
          />
          <DotGrid />

          <View style={{ position: 'relative', zIndex: 2 }}>
            <MountFade delay={0}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: C.radiusPill,
                  backgroundColor: C.tealDim,
                  borderWidth: 1,
                  borderColor: 'rgba(0,229,196,0.2)',
                  marginBottom: 24,
                }}
              >
                <PingDot />
                <Text
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12,
                    color: C.teal,
                    letterSpacing: 3,
                  }}
                >
                  AFRICA&apos;S ENERGY OPERATING SYSTEM
                </Text>
              </View>
            </MountFade>

            <MountFade delay={150}>
              <Text
                style={{
                  fontFamily: F.syne,
                  fontSize: 72,
                  lineHeight: 68,
                  color: C.text,
                }}
              >
                ESO
              </Text>
              <Text
                style={{
                  fontFamily: F.syne,
                  fontSize: 72,
                  lineHeight: 68,
                  color: C.teal,
                  textShadowColor: 'rgba(0,229,196,0.3)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 30,
                  marginBottom: 20,
                }}
              >
                ENERGY
              </Text>
            </MountFade>

            <MountFade delay={300}>
              <Text
                style={{
                  fontFamily: F.mono,
                  fontSize: 13,
                  color: C.muted2,
                  lineHeight: 22,
                  maxWidth: 320,
                  marginBottom: 36,
                }}
              >
                Hybrid Solar-Grid Orchestration, Fuel Security & Real-Time Asset Intelligence — built
                for Africa.
              </Text>
            </MountFade>

            <MountFade delay={450}>
              <ShimmerButton label="Request Access  →" onPress={goDemo} />
              <Pressable
                onPress={scrollToMetrics}
                style={{
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontFamily: F.mono, fontSize: 13, color: C.teal }}>
                  See how it works  ↓
                </Text>
              </Pressable>
            </MountFade>

            <MountFade delay={800}>
              <FloatingChip />
            </MountFade>
          </View>
        </View>

        {/* §3 Trust bar */}
        <RevealSection scrollY={scrollY} viewportH={viewportH}>
          <View
            style={{
              backgroundColor: C.bg2,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: C.glassBorder,
              paddingVertical: 24,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontFamily: F.mono,
                fontSize: 12,
                color: C.muted,
                letterSpacing: 2,
                marginBottom: 20,
              }}
            >
              TRUSTED BY AFRICA&apos;S LEADING ENTERPRISES
            </Text>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: C.padH, gap: 24, alignItems: 'center' }}
            >
              {TRUST_LOGOS.map((name) => (
                <View
                  key={name}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: C.radiusPill,
                    backgroundColor: C.glass,
                    borderWidth: 1,
                    borderColor: C.glassBorder,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: F.monoMed,
                      fontSize: 12,
                      color: C.muted,
                      letterSpacing: 1,
                    }}
                  >
                    {name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </RevealSection>

        {/* §4 Platform stats */}
        <RevealSection scrollY={scrollY} viewportH={viewportH}>
          <View style={{ paddingHorizontal: C.padH, paddingTop: C.sectionGap, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: F.mono,
                fontSize: 12,
                color: C.teal,
                letterSpacing: 3,
                marginBottom: 8,
              }}
            >
              PLATFORM INTELLIGENCE
            </Text>
            <Text
              style={{
                fontFamily: F.syne,
                fontSize: 28,
                color: C.text,
                marginBottom: 32,
                textAlign: 'center',
              }}
            >
              Real numbers. Real time.
            </Text>

            <View className="w-full gap-3">
              {STATS.map((stat) => (
                <RevealSection key={stat.label} scrollY={scrollY} viewportH={viewportH}>
                  {(revealed) => (
                    <GlassCard
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderLeftWidth: 3,
                        borderLeftColor: stat.accent,
                        paddingVertical: 24,
                      }}
                    >
                      <Text
                        style={{
                          position: 'absolute',
                          right: 16,
                          top: 8,
                          fontFamily: F.bebas,
                          fontSize: 48,
                          color: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        {stat.ghost}
                      </Text>
                      <View>
                        <CountUpStat
                          target={stat.target}
                          suffix={stat.suffix}
                          decimals={stat.decimals}
                          active={revealed}
                          color={stat.accent}
                        />
                        <Text
                          style={{
                            fontFamily: F.mono,
                            fontSize: 12,
                            color: C.muted,
                            letterSpacing: 2,
                            marginTop: 4,
                          }}
                        >
                          {stat.label}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 26,
                          backgroundColor: `${stat.accent}18`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <stat.Icon size={28} color={stat.accent} strokeWidth={2} />
                      </View>
                    </GlassCard>
                  )}
                </RevealSection>
              ))}
            </View>
          </View>
        </RevealSection>

        {/* §5 How it works */}
        <RevealSection scrollY={scrollY} viewportH={viewportH}>
          <View style={{ paddingHorizontal: C.padH, paddingTop: C.sectionGap }}>
            <Text
              style={{
                fontFamily: F.mono,
                fontSize: 12,
                color: C.teal,
                letterSpacing: 3,
                marginBottom: 8,
              }}
            >
              HOW IT WORKS
            </Text>
            <Text
              style={{
                fontFamily: F.syne,
                fontSize: 28,
                color: C.text,
                marginBottom: 32,
              }}
            >
              Three steps to total energy control.
            </Text>

            {STEPS.map((step, idx) => (
              <View key={step.n}>
                <GlassCard style={{ position: 'relative', paddingVertical: 24 }}>
                  <Text
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      fontFamily: F.bebas,
                      fontSize: 80,
                      lineHeight: 80,
                      color: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {step.n}
                  </Text>
                  <View className="mb-3 flex-row items-center gap-3.5">
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: `${step.accent}18`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <step.Icon size={20} color={step.accent} />
                    </View>
                    <Text
                      style={{
                        fontFamily: F.mono,
                        fontSize: 12,
                        color: C.muted,
                        letterSpacing: 2,
                      }}
                    >
                      STEP {step.n}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: F.syneBold,
                      fontSize: 18,
                      color: C.text,
                      marginBottom: 8,
                    }}
                  >
                    {step.title}
                  </Text>
                  <Text style={{ fontFamily: F.mono, fontSize: 13, color: C.muted2, lineHeight: 22 }}>
                    {step.body}
                  </Text>
                </GlassCard>
                {idx < 2 ? (
                  <View
                    style={{
                      width: 1,
                      height: 24,
                      alignSelf: 'center',
                      backgroundColor: C.glassBorder,
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </RevealSection>

        {/* §8 Testimonial */}
        <RevealSection scrollY={scrollY} viewportH={viewportH}>
          <View style={{ paddingHorizontal: C.padH, paddingTop: C.sectionGap }}>
            <GlassCard
              style={{
                borderLeftWidth: 4,
                borderLeftColor: C.amber,
                paddingVertical: 28,
                paddingHorizontal: 24,
              }}
            >
              <Text style={{ fontFamily: F.syne, fontSize: 16, color: C.amber, marginBottom: 16 }}>
                ★★★★★
              </Text>
              <Text
                style={{
                  fontFamily: F.syneBold,
                  fontSize: 18,
                  color: C.text,
                  lineHeight: 28,
                }}
              >
                <Text style={{ fontFamily: F.monoItalic, fontSize: 28, color: C.teal }}>&ldquo;</Text>
                ESO cut our generator runtime by 60% within 3 months. The ROI was visible in the
                first bill.
                <Text style={{ fontFamily: F.monoItalic, fontSize: 28, color: C.teal }}>&rdquo;</Text>
              </Text>
              <View className="mt-5 flex-row items-center gap-3">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: C.amberDim,
                    borderWidth: 1,
                    borderColor: C.amber,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: F.syneBold, fontSize: 14, color: C.amber }}>AO</Text>
                </View>
                <View>
                  <Text style={{ fontFamily: F.syneBold, fontSize: 13, color: C.text }}>
                    Adewale Okonkwo
                  </Text>
                  <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>
                    Head of Operations, Dangote Group
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>
        </RevealSection>

        {/* §9 Final CTA */}
        <RevealSection scrollY={scrollY} viewportH={viewportH}>
          <View style={{ paddingHorizontal: C.padH, paddingTop: C.sectionGap, paddingBottom: 24 }}>
            <View
              style={{
                backgroundColor: C.bg2,
                borderWidth: 1,
                borderColor: C.glassBorder,
                borderRadius: C.radius,
                paddingVertical: 40,
                paddingHorizontal: 24,
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  backgroundColor: C.tealGlow,
                  opacity: 0.4,
                }}
              />
              <Text
                style={{
                  fontFamily: F.mono,
                  fontSize: 12,
                  color: C.teal,
                  letterSpacing: 3,
                  marginBottom: 12,
                }}
              >
                READY TO GET STARTED?
              </Text>
              <Text
                style={{
                  fontFamily: F.syne,
                  fontSize: 32,
                  color: C.text,
                  textAlign: 'center',
                  lineHeight: 36,
                  marginBottom: 8,
                }}
              >
                Take control of your energy.
              </Text>
              <Text
                style={{
                  fontFamily: F.mono,
                  fontSize: 13,
                  color: C.muted2,
                  textAlign: 'center',
                  marginBottom: 32,
                }}
              >
                No commitment. Setup in 48 hours. Cancel anytime.
              </Text>
              <ShimmerButton label="Request Access  →" onPress={goDemo} />
              <View style={{ height: 16 }} />
              <ShimmerButton label="Talk to Sales  →" onPress={goDemo} variant="outline" />
              <View className="mt-5 flex-row flex-wrap justify-center gap-2">
                {['🔒 Secure', '✓ No contracts', '⚡ 48hr setup'].map((pill) => (
                  <View
                    key={pill}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: C.radiusPill,
                      backgroundColor: C.glass,
                      minHeight: 32,
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>{pill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </RevealSection>

        {/* §10 Footer */}
        <View
          style={{
            backgroundColor: C.bg2,
            borderTopWidth: 1,
            borderTopColor: C.glassBorder,
            paddingHorizontal: C.padH,
            paddingTop: 32,
            paddingBottom: 32 + insets.bottom,
          }}
        >
          <View className="flex-row items-center">
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: C.teal,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: F.syne, fontSize: 12, color: C.bg }}>E</Text>
            </View>
            <Text style={{ marginLeft: 8, fontFamily: F.syne, fontSize: 14, color: C.text }}>
              ESO ENERGY
            </Text>
          </View>
          <Text
            style={{
              marginTop: 8,
              fontFamily: F.mono,
              fontSize: 12,
              color: C.muted,
              letterSpacing: 1,
            }}
          >
            Africa&apos;s Premier Energy OS
          </Text>
          <View className="mt-5 flex-row flex-wrap gap-5">
            {['Privacy', 'Terms', 'Contact', 'Careers'].map((link) => (
              <Pressable key={link} style={{ minHeight: 48, justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted2 }}>{link}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: 1, backgroundColor: C.glassBorder, marginVertical: 20 }} />
          <View className="flex-row flex-wrap justify-between gap-2">
            <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>
              © 2025 ESO Energy Ltd.
            </Text>
            <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>
              Lagos · Abuja · Accra
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
