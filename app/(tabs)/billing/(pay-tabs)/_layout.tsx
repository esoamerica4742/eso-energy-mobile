import { Tabs } from 'expo-router';

import { EsoPayBottomNav } from '@/esopay/components/EsoPayBottomNav';

import { ds } from '@/esopay/theme/designSystem';



export default function EsoPayTabLayout() {

  return (

    <Tabs

      screenOptions={{

        headerShown: false,

        tabBarStyle: { display: 'none' },

        sceneStyle: { backgroundColor: ds.color.bg },

        animation: 'fade',

      }}

      tabBar={(props) => <EsoPayBottomNav {...props} />}

    >

      <Tabs.Screen name="index" options={{ title: 'Home' }} />

      <Tabs.Screen
        name="intelligence"
        options={{
          title: 'Power Shield',
          sceneStyle: { backgroundColor: ds.color.bg },
        }}
      />

      <Tabs.Screen
        name="bills"
        options={{
          title: 'Billing',
          sceneStyle: { backgroundColor: ds.color.bg },
        }}
      />

      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />

      <Tabs.Screen name="history" options={{ href: null, title: 'History' }} />

      <Tabs.Screen name="wallet" options={{ href: null, title: 'Wallet' }} />

    </Tabs>

  );

}

