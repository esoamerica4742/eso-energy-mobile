import { Tabs } from 'expo-router';
import { PremiumTabBar } from '@/components/navigation/PremiumTabBar';
import { useAlertStore } from '@/stores/alertStore';

export default function TabLayout() {
  const unreadCount = useAlertStore((s) => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index]?.name;
        // ESO Pay renders its own bottom nav — hide fleet tab bar while inside billing.
        if (activeRoute === 'billing') {
          return null;
        }
        return <PremiumTabBar {...props} unreadCount={unreadCount} />;
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Monitor' }} />
      <Tabs.Screen name="monitor" options={{ href: null, title: 'Monitor' }} />
      <Tabs.Screen name="sites" options={{ title: 'Sites' }} />
      <Tabs.Screen name="billing" options={{ href: null, title: 'Eso Pay Bills' }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
