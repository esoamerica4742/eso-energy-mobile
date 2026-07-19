import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';
import { ECO_MOTION } from '@/theme/ecosystem';

type TabItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { id: 'Sites', label: 'Sites', icon: 'business-outline' },
  { id: 'Alerts', label: 'Alerts', icon: 'notifications-outline' },
  { id: 'Settings', label: 'Settings', icon: 'settings-outline' },
];

type Props = {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  alertCount?: number;
};

function TabItemButton({
  tab,
  active,
  alertCount,
  onPress,
}: {
  tab: TabItem;
  active: boolean;
  alertCount: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(active ? 1.08 : 1);
  const indicator = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(active ? 1.08 : 1, ECO_MOTION.springSnappy);
    indicator.value = withTiming(active ? 1 : 0, { duration: ECO_MOTION.duration });
  }, [active, indicator, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicator.value,
    transform: [{ scaleX: indicator.value }],
  }));

  const showBadge = tab.id === 'Alerts' && alertCount > 0;

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Ionicons
          name={tab.icon}
          size={active ? 24 : 22}
          color={active ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
          style={!active ? styles.iconInactive : undefined}
        />
        {showBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{alertCount > 9 ? '9+' : String(alertCount)}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

export function BottomNav({
  activeTab = 'Dashboard',
  onTabChange,
  alertCount = 0,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { height: 70 + insets.bottom, paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => (
        <TabItemButton
          key={tab.id}
          tab={tab}
          active={tab.id === activeTab}
          alertCount={alertCount}
          onPress={() => onTabChange?.(tab.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 54,
  },
  indicator: {
    position: 'absolute',
    top: 7,
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  iconWrap: {
    position: 'relative',
  },
  iconInactive: {
    opacity: 0.55,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.fault,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: Fonts.medium,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.35,
    includeFontPadding: false,
  },
  labelActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.medium,
  },
  labelInactive: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: Fonts.light,
    opacity: 0.9,
  },
});
