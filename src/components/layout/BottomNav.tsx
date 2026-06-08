import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';

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

export function BottomNav({
  activeTab = 'Dashboard',
  onTabChange,
  alertCount = 0,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { height: 64 + insets.bottom, paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
        const active = tab.id === activeTab;
        const showBadge = tab.id === 'Alerts' && alertCount > 0;

        return (
          <Pressable
            key={tab.id}
            style={styles.item}
            onPress={() => onTabChange?.(tab.id)}
          >
            {active ? <View style={styles.indicator} /> : null}
            <View style={styles.iconWrap}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? Colors.gold : Colors.textMuted}
              />
              {showBadge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {alertCount > 9 ? '9+' : String(alertCount)}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9,9,11,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,76,0.10)',
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.gold,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.mint,
    borderWidth: 1.5,
    borderColor: Colors.bg,
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
    letterSpacing: 0.5,
  },
  labelActive: {
    color: Colors.gold,
    fontFamily: Fonts.regular,
  },
  labelInactive: {
    color: Colors.textMuted,
    fontFamily: Fonts.light,
  },
});
