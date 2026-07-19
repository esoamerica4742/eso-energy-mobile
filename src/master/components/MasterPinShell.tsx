import { useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { PinDots } from '@/esopay/components/pin/PinDots';
import { useShakeAnimation } from '@/lib/motion/springMotion';
import { MASTER_PIN_LENGTH } from '@/master/constants';
import { inter } from '@/theme/fonts';

const BG = '#000000';
const TEXT = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.55)';
const ERROR = '#FF6B6B';
const NAVY = '#0B152B';
const NAVY_MID = '#050A14';

export type MasterPinStep = 'create' | 'confirm' | 'unlock';

type Props = {
  mode: 'setup' | 'unlock';
  step?: MasterPinStep;
  title: string;
  subtitle: string;
  filledCount: number;
  error?: string | null;
  footer?: ReactNode;
  keypad: ReactNode;
  paddingTop: number;
  paddingBottom: number;
  /** Setup progress: 1 = create, 2 = confirm */
  progressStep?: 1 | 2;
};

export function MasterPinShell({
  mode,
  step,
  title,
  subtitle,
  filledCount,
  error,
  footer,
  keypad,
  paddingTop,
  paddingBottom,
  progressStep,
}: Props) {
  const { style: shakeStyle, shake } = useShakeAnimation();
  const showProgress = mode === 'setup' && (progressStep === 1 || progressStep === 2);
  const stepKey = step ?? 'unlock';

  useEffect(() => {
    if (error) shake();
  }, [error, shake]);

  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={[NAVY, NAVY_MID, BG]}
        locations={[0, 0.4, 1]}
        style={styles.wash}
      />

      <View style={[styles.body, { paddingTop, paddingBottom }]}>
        <View style={styles.hero}>
          {showProgress ? (
            <View style={styles.progressRow}>
              <View style={[styles.progressSeg, progressStep >= 1 && styles.progressSegOn]} />
              <View style={[styles.progressSeg, progressStep >= 2 && styles.progressSegOn]} />
            </View>
          ) : null}

          <Animated.View key={stepKey} entering={FadeInDown.duration(280).springify().damping(20)}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animated.View>

          <View style={styles.dotsWrap}>
            <PinDots
              filledCount={filledCount}
              length={MASTER_PIN_LENGTH}
              animateFill
              shakeStyle={shakeStyle}
              variant="quiet"
            />
          </View>

          {error ? (
            <Animated.Text entering={FadeIn.duration(180)} style={styles.error}>
              {error}
            </Animated.Text>
          ) : (
            <View style={styles.errorSlot} />
          )}
        </View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}

        <View style={styles.keypad}>{keypad}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
  },
  body: {
    flex: 1,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    alignItems: 'center',
    minHeight: 0,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 28,
  },
  progressSeg: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  progressSegOn: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: inter.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.7,
    color: TEXT,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 40,
    alignSelf: 'center',
  },
  dotsWrap: {
    minHeight: 32,
    justifyContent: 'center',
    transform: [{ scale: 1.08 }],
  },
  error: {
    marginTop: 22,
    fontFamily: inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: ERROR,
    textAlign: 'center',
  },
  errorSlot: {
    marginTop: 22,
    height: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  keypad: {
    paddingBottom: 8,
  },
});
