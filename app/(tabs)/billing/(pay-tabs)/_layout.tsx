import { Tabs } from 'expo-router';

import { EsoPayBottomNav } from '@/esopay/components/EsoPayBottomNav';

import { luxury } from '@/esopay/theme/luxury';



export default function EsoPayTabLayout() {

  return (

    <Tabs

      screenOptions={{

        headerShown: false,

        tabBarStyle: { display: 'none' },

        sceneStyle: { backgroundColor: luxury.bg },

        animation: 'fade',

      }}

      tabBar={(props) => <EsoPayBottomNav {...props} />}

    >

      <Tabs.Screen name="index" options={{ title: 'Home' }} />

      <Tabs.Screen
        name="intelligence"
        options={{
          title: 'Power Shield',
          sceneStyle: { backgroundColor: '#0A0A0A' },
        }}
      />

      <Tabs.Screen
        name="bills"
        options={{
          title: 'Billing',
          sceneStyle: { backgroundColor: luxury.bg },
        }}
      />

      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />

      <Tabs.Screen name="history" options={{ href: null, title: 'History' }} />

      <Tabs.Screen name="wallet" options={{ href: null, title: 'Wallet' }} />

    </Tabs>

  );

}

