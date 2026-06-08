import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import {
  Home,
  Receipt,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PS } from '@/esopay/components/power-shield/powerShieldTheme';
import { usePowerShield } from '@/esopay/hooks/usePowerShield';
import { inter } from '@/theme/fonts';
const TAB_AMBER = PS.amber;
const TAB_INACTIVE = PS.inactive;

const TAB_HEIGHT = 64;
const ICON_SIZE = 24;

const TAB_ORDER = ['index', 'intelligence', 'bills', 'settings'] as const;

type TabName = (typeof TAB_ORDER)[number];

const TAB_META: Record<TabName, { label: string; Icon: LucideIcon; shieldBadge?: boolean }> = {
  index: { label: 'Home', Icon: Home },
  intelligence: { label: 'Power Shield', Icon: Shield, shieldBadge: true },
  bills: { label: 'Billing', Icon: Receipt },
  settings: { label: 'Settings', Icon: Settings },
};

type Props = BottomTabBarProps;

function ShieldProtectionDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.shieldDot, dotStyle]}>
      <View style={styles.shieldDotCore} />
    </Animated.View>
  );
}

function TabIcon({
  focused,
  Icon,
  shieldBadge,
  shieldActive,
}: {
  focused: boolean;
  Icon: LucideIcon;
  shieldBadge?: boolean;
  shieldActive?: boolean;
}) {
  const scale = useSharedValue(focused ? 1.06 : 1);
  const pulse = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.06 : 1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, scale]);

  useEffect(() => {
    if (!shieldBadge || !shieldActive) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [shieldActive, shieldBadge, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  const iconColor = focused ? TAB_AMBER : TAB_INACTIVE;

  return (
    <Animated.View style={[styles.iconBox, animatedStyle]}>
      <Icon
        size={ICON_SIZE}
        color={iconColor}
        strokeWidth={focused ? 2.6 : 2.2}
        fill={focused && shieldBadge ? 'rgba(240, 165, 0, 0.18)' : 'transparent'}
      />
      {shieldBadge && shieldActive ? <ShieldProtectionDot /> : null}
    </Animated.View>
  );
}

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  return (
    <Text
      style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
}

export function EsoPayBottomNav({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data: powerShieldData } = usePowerShield();
  const shieldActive = (powerShieldData?.meters?.length ?? 0) > 0;
  const orderedRoutes = useMemo(() => {
    const byName = new Map(state.routes.map((route) => [route.name, route]));
    return TAB_ORDER.map((name) => byName.get(name)).filter(Boolean) as typeof state.routes;
  }, [state.routes]);

  const navHeight = TAB_HEIGHT + insets.bottom;

  const bar = (
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {orderedRoutes.map((route) => {
        const meta = TAB_META[route.name as TabName];
        if (!meta) return null;

        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const focused = state.index === routeIndex;
        const { Icon, label, shieldBadge } = meta;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={shieldBadge ? `${label}, protection active` : label}
          >
            <TabIcon
              focused={focused}
              Icon={Icon}
              shieldBadge={shieldBadge}
              shieldActive={shieldBadge ? shieldActive : undefined}
            />
            <TabLabel focused={focused} label={label} />
            {focused ? <View style={styles.activeIndicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.wrap, { height: navHeight }]}>
      {Platform.OS === 'web' ? (
        <View style={styles.blurFallback}>{bar}</View>
      ) : (
        <BlurView intensity={20} tint="dark" style={styles.blur}>
          {bar}
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
  },
  blurFallback: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
  },
  dock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: TAB_HEIGHT,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 0,
    paddingVertical: 6,
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shieldDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  shieldDotCore: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34D399',
  },
  label: {
    fontFamily: inter.medium,
    fontSize: 10,
    letterSpacing: 0.35,
    textAlign: 'center',
  },
  labelInactive: {
    color: TAB_INACTIVE,
    fontFamily: inter.regular,
    fontSize: 11,
  },
  labelActive: {
    color: TAB_AMBER,
    fontFamily: inter.medium,
    fontSize: 11,
    fontWeight: '600',
  },
  activeIndicator: {
    marginTop: 2,
    width: 36,
    height: 2,
    borderRadius: 999,
    backgroundColor: TAB_AMBER,
  },
});
