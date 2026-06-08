import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AuthButton } from '../components/AuthButton';
import { useAuth } from '../hooks/useAuth';
import {
  ESOPAY_HOME_ROUTE,
  MONITORING_HOME_ROUTE,
} from '@/lib/navigation/productRoutes';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { C, F, welcomeSubtitle } from '../theme/authTheme';

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function useCountUp(target, active, duration = 1500, decimals = 1) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(target * easeOutExpo(p));
      if (p < 1) requestAnimationFrame(tick);
    };
    setVal(0);
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  const text =
    decimals === 0
      ? Math.round(val).toLocaleString('en-US')
      : val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return text;
}

function PulseDot() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={[styles.pulseDot, style]} />;
}

function RotatingRing() {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1);
  }, [rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <Animated.View style={[styles.ringWrap, style]}>
      <Svg width={96} height={96}>
        <Circle
          cx={48}
          cy={48}
          r={44}
          stroke={C.GOLD_BORDER}
          strokeWidth={1}
          strokeDasharray="8 12"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

const STATS = [
  { target: 420.5, suffix: 'kW', label: 'Current Load', decimals: 1 },
  { target: 98.4, suffix: '%', label: 'Efficiency', decimals: 1 },
  { target: 48, suffix: 'hrs', label: 'Setup Time', decimals: 0 },
];

function paramString(value) {
  if (Array.isArray(value)) return value[0] ?? '';
  return (value ?? '').toString();
}

export default function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const name = paramString(params.name) || 'there';
  const module = paramString(params.module) || 'inverter';
  const returning = paramString(params.returning) === '1';
  const { setModule, setOnboardingComplete } = useAuth();
  const [countActive, setCountActive] = useState(false);

  const outerScale = useSharedValue(0);
  const innerScale = useSharedValue(0);
  const enterScale = useSharedValue(0.94);
  const enterOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    enterOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    enterScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    outerScale.value = withSpring(1, { damping: 14 });
    innerScale.value = withDelay(150, withSpring(1, { damping: 14 }));
    const t = setTimeout(() => setCountActive(true), 700);
    setOnboardingComplete(true);
    return () => clearTimeout(t);
  }, [enterOpacity, enterScale, outerScale, innerScale, setOnboardingComplete]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ scale: enterScale.value }],
  }));

  const outerStyle = useAnimatedStyle(() => ({ transform: [{ scale: outerScale.value }] }));
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: innerScale.value }] }));

  const load1 = useCountUp(STATS[0].target, countActive, 1500, STATS[0].decimals);
  const load2 = useCountUp(STATS[1].target, countActive, 1500, STATS[1].decimals);
  const load3 = useCountUp(STATS[2].target, countActive, 1500, STATS[2].decimals);
  const values = [load1, load2, load3];

  const enterDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    void setLastProduct('monitoring');
    setModule('inverter');
    router.replace(MONITORING_HOME_ROUTE);
  };

  const goEsoPayDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void setLastProduct('esopay');
    setModule('esopay');
    router.replace(ESOPAY_HOME_ROUTE);
  };

  const isEsoPay = module === 'esopay';
  const dashboardCta = isEsoPay ? 'Open Eso Pay →' : 'Enter Dashboard →';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.glow} pointerEvents="none" />
      <Animated.View style={[styles.center, screenStyle]}>
        <View style={styles.iconBlock}>
          <RotatingRing />
          <Animated.View style={[styles.outerRing, outerStyle]}>
            <Animated.View style={innerStyle}>
              <LinearGradient
                colors={[C.GOLD_DARK, C.GOLD_MID]}
                style={styles.innerRing}
              >
                <Animated.View entering={FadeIn.delay(300)}>
                  <Ionicons name="checkmark" size={28} color={C.DARK_1} />
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoLetter}>E</Text>
          </View>
          <Text style={styles.logoText}>ESO ENERGY</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.welcomeOff}>Welcome,</Text>
          <MaskedView
            maskElement={
              <Text style={[styles.welcomeName, { backgroundColor: 'transparent' }]}>{name}.</Text>
            }
          >
            <LinearGradient colors={[C.GOLD_DARK, C.GOLD_MID, C.GOLD_LIGHT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={[styles.welcomeName, { opacity: 0 }]}>{name}.</Text>
            </LinearGradient>
          </MaskedView>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(350).duration(500)} style={styles.sub}>
          {welcomeSubtitle(returning, module)}
        </Animated.Text>

        {!isEsoPay ? (
          <>
            <Animated.View entering={FadeIn.delay(500)} style={styles.statusPill}>
              <PulseDot />
              <Text style={styles.statusText}>Setting up your workspace...</Text>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(600)} style={styles.statsRow}>
              {STATS.map((s, i) => (
                <View key={s.label} style={styles.statPill}>
                  <Text style={styles.statValue}>
                    {values[i]}
                    {s.suffix}
                  </Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </Animated.View>
          </>
        ) : null}

        <Animated.View entering={FadeInUp.delay(700).duration(500)} style={styles.cta}>
          <AuthButton
            label={dashboardCta}
            onPress={isEsoPay ? goEsoPayDashboard : enterDashboard}
          />
          {!isEsoPay ? (
            <Pressable
              onPress={goEsoPayDashboard}
              style={styles.esopayDashLink}
              accessibilityRole="button"
              accessibilityLabel="Go to Eso Pay Bills"
            >
              <Text style={styles.esopayDashLinkText}>👉 Go to Eso Pay Bills</Text>
            </Pressable>
          ) : null}
          <Text style={styles.footerNote}>
            {isEsoPay
              ? 'Fund your wallet anytime from the home tab.'
              : 'Your team will receive an onboarding email shortly.'}
          </Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.DARK_1 },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201,168,76,0.08)',
    alignSelf: 'center',
    top: '22%',
  },
  center: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBlock: { width: 96, height: 96, marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  ringWrap: { position: 'absolute', width: 96, height: 96 },
  outerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: C.GOLD_BORDER,
    backgroundColor: C.GOLD_TINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: -8 },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoLetter: { fontFamily: F.cormorant, fontSize: 12, color: C.DARK_1 },
  logoText: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.OFF_WHITE,
    opacity: 0.3,
    letterSpacing: 3,
  },
  welcomeOff: {
    fontFamily: F.cormorant,
    fontSize: 52,
    lineHeight: 56,
    color: C.OFF_WHITE,
    textAlign: 'center',
  },
  welcomeName: {
    fontFamily: F.cormorant,
    fontSize: 52,
    lineHeight: 56,
    textAlign: 'center',
  },
  sub: {
    marginTop: 16,
    fontFamily: F.sansLight,
    fontSize: 16,
    lineHeight: 26,
    color: C.OFF_WHITE,
    opacity: 0.55,
    textAlign: 'center',
  },
  statusPill: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.TEAL_DIM,
    borderWidth: 0.5,
    borderColor: C.TEAL,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.TEAL,
  },
  statusText: {
    marginLeft: 8,
    fontFamily: F.sansLight,
    fontSize: 13,
    color: C.TEAL,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: {
    backgroundColor: C.DARK_2,
    borderWidth: 0.5,
    borderColor: C.DARK_3,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 96,
    alignItems: 'center',
  },
  statValue: { fontFamily: F.mono, fontSize: 18, color: C.TEAL },
  statLabel: {
    marginTop: 2,
    fontFamily: F.sansLight,
    fontSize: 10,
    color: C.OFF_WHITE,
    opacity: 0.4,
  },
  cta: { marginTop: 48, width: '100%' },
  esopayDashLink: {
    marginTop: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  esopayDashLinkText: {
    fontFamily: F.sansMed,
    fontSize: 13,
    color: C.GOLD_LIGHT,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerNote: {
    marginTop: 16,
    fontFamily: F.sansLight,
    fontSize: 12,
    color: C.OFF_WHITE,
    opacity: 0.3,
    textAlign: 'center',
    lineHeight: 18,
  },
});
