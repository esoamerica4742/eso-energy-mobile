import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Gear, House, Lightning, Receipt, type Icon as PhosphorIcon } from 'phosphor-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ESO_PAY_TEXT_PRIMARY,
  NAV_BAR_BG,
  NAV_INACTIVE,
  NAV_INACTIVE_DUOTONE,
  NAV_INACTIVE_LABEL,
} from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';
import { ECO_MOTION } from '@/theme/ecosystem';
import { useTabPressBounce } from '@/lib/motion/springMotion';

const TAB_COUNT = 4;
const NAV_BAR_HEIGHT = 70;
const NAV_BORDER_RADIUS = 30;
const BAR_WIDTH_RATIO = 0.94;
const FLOAT_MARGIN_BOTTOM = 12;
const ICON_SIZE = 22;
const TRANSITION_MS = ECO_MOTION.durationSlow;

const TAB_ORDER = ['index', 'intelligence', 'bills', 'settings'] as const;

type TabName = (typeof TAB_ORDER)[number];

const TAB_META: Record<TabName, { label: string; Icon: PhosphorIcon }> = {
  index: { label: 'Home', Icon: House },
  intelligence: { label: 'Power', Icon: Lightning },
  bills: { label: 'Pay', Icon: Receipt },
  settings: { label: 'Settings', Icon: Gear },
};

type Props = BottomTabBarProps;

function TabIcon({ focused, Icon }: { focused: boolean; Icon: PhosphorIcon }) {
  const scale = useSharedValue(focused ? 1.06 : 1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.06 : 1, {
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = focused ? ESO_PAY_TEXT_PRIMARY : NAV_INACTIVE;
  const iconDuotone = focused ? 'rgba(255, 255, 255, 0.35)' : NAV_INACTIVE_DUOTONE;

  return (
    <Animated.View style={[styles.iconBox, animatedStyle]}>
      <Icon
        size={ICON_SIZE}
        color={iconColor}
        weight={focused ? 'duotone' : 'regular'}
        duotoneColor={iconDuotone}
      />
    </Animated.View>
  );
}

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  const opacity = useSharedValue(focused ? 1 : 0.76);

  useEffect(() => {
    opacity.value = withTiming(focused ? 1 : 0.76, {
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, opacity]);

  const labelStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text
      style={[styles.label, focused ? styles.labelActive : styles.labelInactive, labelStyle]}
      allowFontScaling={false}
    >
      {label}
    </Animated.Text>
  );
}

function TabButton({
  onPress,
  focused,
  label,
  Icon,
}: {
  onPress: () => void;
  focused: boolean;
  label: string;
  Icon: PhosphorIcon;
}) {
  const { style: bounceStyle, bounce } = useTabPressBounce();

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        bounce();
        onPress();
      }}
      style={styles.tab}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.tabInner, bounceStyle]}>
        <TabIcon focused={focused} Icon={Icon} />
        <TabLabel focused={focused} label={label} />
      </Animated.View>
    </Pressable>
  );
}

export function EsoPayBottomNav({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const orderedRoutes = useMemo(() => {
    const byName = new Map(state.routes.map((route) => [route.name, route]));
    return TAB_ORDER.map((name) => byName.get(name)).filter(Boolean) as typeof state.routes;
  }, [state]);

  const focusedTabIndex = useMemo(() => {
    const activeRoute = state.routes[state.index];
    if (!activeRoute) return 0;
    const orderIndex = TAB_ORDER.indexOf(activeRoute.name as TabName);
    return orderIndex >= 0 ? orderIndex : 0;
  }, [state.index, state.routes]);

  const barWidth = screenWidth * BAR_WIDTH_RATIO;
  const tabSlotWidth = barWidth / TAB_COUNT;

  const pillX = useSharedValue(focusedTabIndex * tabSlotWidth);

  useEffect(() => {
    pillX.value = withTiming(focusedTabIndex * tabSlotWidth, {
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [focusedTabIndex, pillX, tabSlotWidth]);

  const slidingPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: tabSlotWidth,
  }));

  const bottomInset = Math.max(insets.bottom, FLOAT_MARGIN_BOTTOM);
  const horizontalPad = (screenWidth - barWidth) / 2;

  const bar = (
    <View style={styles.dock}>
      <Animated.View style={[styles.slidingPill, slidingPillStyle]} pointerEvents="none" />
      {orderedRoutes.map((route) => {
        const meta = TAB_META[route.name as TabName];
        if (!meta) return null;

        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const focused = state.index === routeIndex;
        const { Icon, label } = meta;

        return (
          <TabButton
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            focused={focused}
            label={label}
            Icon={Icon}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[styles.wrap, { paddingBottom: bottomInset, paddingHorizontal: horizontalPad }]}
      pointerEvents="box-none"
    >
      <View style={styles.barShadow}>
        {Platform.OS === 'web' ? (
          <View style={styles.blurShell}>
            <View style={styles.innerBorder} pointerEvents="none" />
            {bar}
          </View>
        ) : (
          <BlurView intensity={64} tint="dark" style={styles.blurShell}>
            <View style={styles.glassOverlay} pointerEvents="none" />
            <View style={styles.innerBorder} pointerEvents="none" />
            {bar}
          </BlurView>
        )}
      </View>
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
  barShadow: {
    borderRadius: NAV_BORDER_RADIUS,
    backgroundColor: NAV_BAR_BG,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  blurShell: {
    borderRadius: NAV_BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: NAV_BAR_BG,
    height: NAV_BAR_HEIGHT,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: NAV_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    margin: 1,
  },
  dock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 8,
    position: 'relative',
  },
  slidingPill: {
    position: 'absolute',
    top: 5,
    left: 4,
    height: NAV_BAR_HEIGHT - 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    zIndex: 1,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 56,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: inter.medium,
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 0.22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  labelInactive: {
    color: NAV_INACTIVE_LABEL,
    fontWeight: '500',
  },
  labelActive: {
    color: ESO_PAY_TEXT_PRIMARY,
    fontFamily: inter.semibold,
    fontWeight: '600',
  },
});
