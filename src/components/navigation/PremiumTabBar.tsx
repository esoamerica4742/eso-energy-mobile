import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from "expo-router/js-tabs";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Bell,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { prefetchForTab } from '@/lib/prefetch';

import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore, selectActiveSite } from '@/stores/siteStore';

const TAB_ORDER = ['index', 'sites', 'reports', 'alerts', 'settings'] as const;

const TAB_META: Record<
  (typeof TAB_ORDER)[number],
  { label: string; Icon: LucideIcon }
> = {
  index: { label: 'Monitor', Icon: LayoutDashboard },
  sites: { label: 'Sites', Icon: Building2 },
  reports: { label: 'Reports', Icon: BarChart3 },
  alerts: { label: 'Alerts', Icon: Bell },
  settings: { label: 'Settings', Icon: Settings },
};

type Props = BottomTabBarProps & {
  unreadCount: number;
};

export function PremiumTabBar({ state, navigation, unreadCount }: Props) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const companyId = useAuthStore(selectTenantId);
  const activeSite = useSiteStore(selectActiveSite);
  const [dockWidth, setDockWidth] = useState(0);
  const pillX = useSharedValue(0);

  const orderedRoutes = useMemo(() => {
    const byName = new Map(state.routes.map((route) => [route.name, route]));
    return TAB_ORDER.map((name) => byName.get(name)).filter(Boolean) as typeof state.routes;
  }, [state]);

  const activeRouteName = state.routes[state.index]?.name ?? 'index';
  const activeOrderedIndex = Math.max(
    0,
    orderedRoutes.findIndex((route) => route.name === activeRouteName),
  );

  const tabWidth = orderedRoutes.length > 0 ? dockWidth / orderedRoutes.length : 0;

  useEffect(() => {
    if (tabWidth <= 0) return;
    const inset = 4;
    pillX.value = withSpring(activeOrderedIndex * tabWidth + inset, {
      damping: 22,
      stiffness: 240,
    });
  }, [activeOrderedIndex, pillX, tabWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: Math.max(tabWidth - 8, 0),
  }));

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View
        style={styles.dock}
        onLayout={(event) => setDockWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.dockTint} pointerEvents="none" />
        <Animated.View style={[styles.activePill, pillStyle]} pointerEvents="none" />
        {orderedRoutes.map((route) => {
          const focused = route.name === activeRouteName;
          const meta = TAB_META[route.name as (typeof TAB_ORDER)[number]] ?? {
            label: route.name,
            Icon: LayoutDashboard,
          };
          return (
            <TabItem
              key={route.key}
              label={meta.label}
              Icon={meta.Icon}
              focused={focused}
              unreadCount={route.name === 'alerts' ? unreadCount : 0}
              onPress={() => {
                void prefetchForTab(queryClient, route.name, {
                  companyId,
                  siteId: activeSite?.id,
                }).catch(() => undefined);
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  focused,
  label,
  Icon,
  unreadCount,
  onPress,
}: {
  focused: boolean;
  label: string;
  Icon: LucideIcon;
  unreadCount: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    if (!focused) return;
    scale.value = withSequence(withTiming(1.08, { duration: 120 }), withTiming(1, { duration: 140 }));
  }, [focused, scale]);

  useEffect(() => {
    if (unreadCount <= 0) return;
    badgeScale.value = withSequence(withTiming(1.25, { duration: 120 }), withTiming(1, { duration: 140 }));
  }, [badgeScale, unreadCount]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const tint = focused ? '#FFFFFF' : 'rgba(255,255,255,0.45)';

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Icon size={20} color={tint} strokeWidth={focused ? 2.2 : 1.8} />
        {unreadCount > 0 ? (
          <Animated.View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </Animated.View>
        ) : null}
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 64,
    borderRadius: 0,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.96)',
  },
  dockTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  activePill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
    zIndex: 1,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: FontSize.micro,
    letterSpacing: 0.5,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000000',
    fontSize: 9,
    fontFamily: fonts.bold,
  },
});
