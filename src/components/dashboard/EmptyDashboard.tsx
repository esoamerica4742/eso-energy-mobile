import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter, type Href } from 'expo-router';
import { useDemoMode } from '@/providers/DemoModeProvider';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

const SITES_ROUTE = '/(tabs)/sites' as Href;
const LINK_DEVICE_ROUTE = '/link-device' as Href;

export type EmptyDashboardVariant = 'no_sites' | 'no_inverters' | 'no_inverters_multi_site';

type Props = {
  variant: EmptyDashboardVariant;
  siteName?: string;
  siteCount?: number;
  headerSlot?: ReactNode;
  /** When set, primary CTA calls this instead of navigating (e.g. Enode link overlay). */
  onPrimaryAction?: () => void | Promise<void>;
  primaryLoading?: boolean;
};

function InverterIllustration() {
  return (
    <View style={styles.illustrationWrap}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        <Defs>
          <SvgGradient id="inverterBody" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#1A2030" />
            <Stop offset="100%" stopColor="#0D1018" />
          </SvgGradient>
          <SvgGradient id="inverterScreen" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="rgba(201,155,58,0.15)" />
            <Stop offset="100%" stopColor="rgba(201,155,58,0.45)" />
          </SvgGradient>
        </Defs>

        <Rect
          x={28}
          y={28}
          width={104}
          height={104}
          rx={18}
          fill="rgba(201,168,76,0.04)"
          stroke="rgba(201,168,76,0.12)"
          strokeWidth={1}
        />

        <Rect x={46} y={58} width={68} height={44} rx={10} fill="url(#inverterBody)" stroke="rgba(201,168,76,0.28)" strokeWidth={1.2} />
        <Rect x={54} y={66} width={52} height={16} rx={4} fill="url(#inverterScreen)" />
        <Rect x={54} y={88} width={18} height={6} rx={2} fill="rgba(255,255,255,0.12)" />
        <Rect x={76} y={88} width={18} height={6} rx={2} fill="rgba(255,255,255,0.12)" />
        <Rect x={98} y={88} width={8} height={6} rx={2} fill="rgba(0,229,160,0.35)" />

        <Circle cx={58} cy={74} r={2.2} fill={Colors.gold} opacity={0.85} />
        <Circle cx={66} cy={74} r={2.2} fill="rgba(255,255,255,0.18)" />
        <Circle cx={74} cy={74} r={2.2} fill="rgba(255,255,255,0.18)" />
      </Svg>
    </View>
  );
}

function getCopy(variant: EmptyDashboardVariant, siteName?: string, siteCount = 0) {
  const label = siteName ?? 'this site';

  if (variant === 'no_sites') {
    return {
      headline: 'No Sites Yet',
      body: 'Add your first site to start monitoring energy, savings, and grid intelligence.',
      cta: 'Add Your First Site',
      route: SITES_ROUTE,
      hint: 'Pull down to refresh after your site is created.',
      steps: ['Add your site', 'Connect your inverter', 'Go live instantly'],
    };
  }

  if (variant === 'no_inverters_multi_site') {
    return {
      headline: 'No Inverters on This Site',
      body: `${label} has no live assets yet. Connect an inverter here, or switch to another site if your fleet is elsewhere.`,
      cta: 'Connect Inverter',
      route: LINK_DEVICE_ROUTE,
      hint: `Pull down to refresh · ${siteCount} sites in your fleet`,
      steps: ['Pick the right site', 'Connect an inverter', 'Return here for live data'],
    };
  }

  return {
    headline: 'No Inverters Connected Yet',
    body: `Connect an inverter to ${label} to unlock live monitoring, savings, and grid intelligence.`,
    cta: 'Connect Inverter',
    route: LINK_DEVICE_ROUTE,
    hint: 'Pull down to refresh once your inverter is linked.',
    steps: ['Link your inverter', 'Wait for first telemetry', 'Dashboard unlocks automatically'],
  };
}

export function EmptyDashboard({
  variant,
  siteName,
  siteCount = 0,
  headerSlot,
  onPrimaryAction,
  primaryLoading = false,
}: Props) {
  const router = useRouter();
  const { enterDemoMode, isDemoMode } = useDemoMode();
  const copy = useMemo(() => getCopy(variant, siteName, siteCount), [variant, siteName, siteCount]);
  const showDemoCta = variant === 'no_sites' && !isDemoMode;
  const completion = useMemo(() => {
    const firstDone = variant !== 'no_sites';
    return [firstDone, false, false] as const;
  }, [variant]);

  const p1 = useRef(new Animated.Value(completion[0] ? 1 : 0)).current;
  const p2 = useRef(new Animated.Value(completion[1] ? 1 : 0)).current;
  const p3 = useRef(new Animated.Value(completion[2] ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(p1, {
      toValue: completion[0] ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [completion, p1]);

  useEffect(() => {
    Animated.timing(p2, {
      toValue: completion[1] ? 1 : 0,
      duration: 300,
      delay: completion[1] ? 150 : 0,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [completion, p2]);

  useEffect(() => {
    Animated.timing(p3, {
      toValue: completion[2] ? 1 : 0,
      duration: 300,
      delay: completion[2] ? 300 : 0,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [completion, p3]);

  const allComplete = completion[0] && completion[1] && completion[2];
  const ctaLabel = allComplete ? 'View Live Dashboard →' : copy.cta;

  return (
    <View style={styles.wrap}>
      {headerSlot ? <View style={styles.headerSlot}>{headerSlot}</View> : null}

      <View style={styles.panel}>
        <InverterIllustration />
        <Text style={styles.headline}>{copy.headline}</Text>
        <Text style={styles.body}>{copy.body}</Text>

        <View style={styles.stepsRow}>
          {copy.steps.map((step, index) => {
            const progress = index === 0 ? p1 : index === 1 ? p2 : p3;
            const bg = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.gold, Colors.battery],
            });
            const textFade = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.5],
            });
            const numOpacity = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            });
            const checkOpacity = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <View key={step} style={styles.stepChip}>
                <Animated.View style={[styles.stepIndexWrap, { backgroundColor: bg }]}>
                  <Animated.Text style={[styles.stepIndex, { opacity: numOpacity }]}>
                    {index + 1}
                  </Animated.Text>
                  <Animated.Text style={[styles.stepCheck, { opacity: checkOpacity }]}>
                    ✓
                  </Animated.Text>
                </Animated.View>
                <Animated.Text style={[styles.stepText, { opacity: textFade }]}>{step}</Animated.Text>
              </View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          disabled={primaryLoading}
          onPress={() => {
            if (onPrimaryAction) {
              void onPrimaryAction();
              return;
            }
            router.push(copy.route);
          }}
          style={({ pressed }) => [
            styles.ctaPressable,
            pressed && !primaryLoading && styles.ctaPressed,
            primaryLoading && styles.ctaDisabled,
          ]}
        >
          <LinearGradient
            colors={['#F8D56A', '#D4AF37', '#A68B2E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            {primaryLoading ? (
              <ActivityIndicator color="#09090B" />
            ) : (
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            )}
          </LinearGradient>
        </Pressable>

        {showDemoCta ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View demo dashboard with sample fleet data"
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              enterDemoMode();
            }}
            style={({ pressed }) => [styles.demoGhostPressable, pressed && styles.demoGhostPressed]}
          >
            <Text style={styles.demoGhostText}>View Demo Dashboard</Text>
          </Pressable>
        ) : null}

        <Text style={styles.hint}>{copy.hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    minHeight: 420,
  },
  headerSlot: {
    alignSelf: 'stretch',
    marginBottom: Spacing.md,
  },
  panel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  panelEyebrow: {
    marginBottom: Spacing.md,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
  illustrationWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg * 0.7,
  },
  headline: {
    color: Colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  body: {
    marginTop: Spacing.sm,
    maxWidth: 320,
    color: Colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    lineHeight: 20,
    textAlign: 'center',
  },
  stepsRow: {
    marginTop: Spacing.lg,
    width: '100%',
    maxWidth: 340,
    gap: Spacing.sm,
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepIndexWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
  },
  stepIndex: {
    color: Colors.bg,
    fontFamily: fonts.bold,
    fontSize: FontSize.micro,
    lineHeight: 12,
  },
  stepCheck: {
    position: 'absolute',
    color: Colors.bg,
    fontFamily: fonts.bold,
    fontSize: FontSize.micro,
    lineHeight: 12,
  },
  stepText: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: FontSize.caption,
  },
  ctaPressable: {
    marginTop: Spacing.lg,
    minWidth: 220,
    borderRadius: Radius.pill,
  },
  ctaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  ctaDisabled: {
    opacity: 0.75,
  },
  ctaGradient: {
    minHeight: 48,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ctaText: {
    color: '#09090B',
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    letterSpacing: 0.2,
  },
  demoGhostPressable: {
    marginTop: Spacing.md,
    minWidth: 220,
    minHeight: 46,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoGhostPressed: {
    opacity: 0.9,
    backgroundColor: Colors.goldWhisper,
    borderColor: Colors.goldBorderStrong,
    transform: [{ scale: 0.98 }],
  },
  demoGhostText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.body,
    letterSpacing: 0.25,
    color: Colors.gold,
  },
  hint: {
    marginTop: Spacing.md,
    color: Colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    textAlign: 'center',
  },
});
