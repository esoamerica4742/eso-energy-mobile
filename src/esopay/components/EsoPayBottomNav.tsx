import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import {
  Gear,
  House,
  Receipt,
  Shield,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ESO_PAY_GOLD,
  ESO_PAY_GOLD_MUTED,
  NAV_BAR_BG,
  NAV_BAR_BORDER,
  NAV_INACTIVE,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { inter } from '@/theme/fonts';
import { usePowerShield } from '@/esopay/hooks/usePowerShield';
import { useTabPressBounce } from '@/lib/motion/springMotion';

const TAB_HEIGHT = 55;
const ICON_SIZE = ds.size.navIcon;
const FLOAT_MARGIN_H = 16;
const FLOAT_MARGIN_BOTTOM = 10;

const TAB_ORDER = ['index', 'intelligence', 'bills', 'settings'] as const;

type TabName = (typeof TAB_ORDER)[number];

const TAB_META: Record<TabName, { label: string; Icon: PhosphorIcon; shieldBadge?: boolean }> = {
  index: { label: 'Home', Icon: House },
  intelligence: { label: 'Shield', Icon: Shield, shieldBadge: true },
  bills: { label: 'Billing', Icon: Receipt },
  settings: { label: 'Settings', Icon: Gear },
};

type Props = BottomTabBarProps;

function ShieldProtectionDot({ active }: { active: boolean }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [active, opacity]);

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
  Icon: PhosphorIcon;
  shieldBadge?: boolean;
  shieldActive?: boolean;
}) {
  const scale = useSharedValue(focused ? 1.06 : 1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.06 : 1, {
      duration: ds.motion.duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = focused ? ESO_PAY_GOLD : NAV_INACTIVE;
  const iconDuotone = focused ? 'rgba(211, 153, 26, 0.35)' : 'rgba(107, 114, 128, 0.5)';

  return (
    <Animated.View style={[styles.iconBox, animatedStyle]}>
      <Icon size={ICON_SIZE} color={iconColor} weight={focused ? 'duotone' : 'regular'} duotoneColor={iconDuotone} />
      {shieldBadge && shieldActive ? <ShieldProtectionDot active={focused} /> : null}
    </Animated.View>
  );
}

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  return (
    <Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive]} numberOfLines={1}>
      {label}
    </Text>
  );
}

function TabButton({
  onPress,
  focused,
  label,
  shieldBadge,
  shieldActive,
  Icon,
}: {
  onPress: () => void;
  focused: boolean;
  label: string;
  shieldBadge?: boolean;
  shieldActive?: boolean;
  Icon: PhosphorIcon;
}) {
  const { style: bounceStyle, bounce } = useTabPressBounce();

  return (
    <Pressable
      onPress={() => {
        bounce();
        onPress();
      }}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={shieldBadge ? `${label}, protection active` : label}
    >
      <Animated.View style={bounceStyle}>
        <TabIcon
          focused={focused}
          Icon={Icon}
          shieldBadge={shieldBadge}
          shieldActive={shieldBadge ? shieldActive : undefined}
        />
        <TabLabel focused={focused} label={label} />
        {focused ? <View style={styles.activeIndicator} /> : <View style={styles.indicatorSpacer} />}
      </Animated.View>
    </Pressable>
  );
}

export function EsoPayBottomNav({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data: powerShieldData } = usePowerShield();
  const shieldActive = (powerShieldData?.meters?.length ?? 0) > 0;

  const orderedRoutes = useMemo(() => {
    const byName = new Map(state.routes.map((route) => [route.name, route]));
    return TAB_ORDER.map((name) => byName.get(name)).filter(Boolean) as typeof state.routes;
  }, [state]);

  const bottomInset = Math.max(insets.bottom, FLOAT_MARGIN_BOTTOM);

  const bar = (
    <View style={[styles.dock, { paddingBottom: 4 }]}>
      {orderedRoutes.map((route) => {
        const meta = TAB_META[route.name as TabName];
        if (!meta) return null;

        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const focused = state.index === routeIndex;
        const { Icon, label, shieldBadge } = meta;

        return (
          <TabButton
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            focused={focused}
            label={label}
            shieldBadge={shieldBadge}
            shieldActive={shieldBadge ? shieldActive : undefined}
            Icon={Icon}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: bottomInset,
          paddingHorizontal: FLOAT_MARGIN_H,
        },
      ]}
      pointerEvents="box-none"
    >
      {Platform.OS === 'web' ? (
        <View style={styles.blurShell}>{bar}</View>
      ) : (
        <BlurView intensity={48} tint="dark" style={styles.blurShell}>
          {bar}
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  blurShell: {
    borderRadius: ds.radius.nav,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NAV_BAR_BORDER,
    backgroundColor: NAV_BAR_BG,
    minHeight: TAB_HEIGHT,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
    paddingVertical: 3,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shieldDot: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ESO_PAY_GOLD_MUTED,
  },
  shieldDotCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ESO_PAY_GOLD,
  },
  label: {
    fontFamily: inter.medium,
    fontSize: ds.type.nav.fontSize,
    lineHeight: ds.type.nav.lineHeight,
    letterSpacing: ds.type.nav.letterSpacing,
    textAlign: 'center',
  },
  labelInactive: {
    color: NAV_INACTIVE,
  },
  labelActive: {
    color: ESO_PAY_GOLD,
    fontFamily: inter.semibold,
    fontWeight: '600',
  },
  activeIndicator: {
    marginTop: 3,
    width: 18,
    height: 3,
    borderRadius: 999,
    backgroundColor: ESO_PAY_GOLD,
  },
  indicatorSpacer: {
    marginTop: 3,
    height: 3,
  },
});
