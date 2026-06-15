import { Stack } from 'expo-router';

import { PaymentModalProvider } from '@/esopay/context/PaymentModalContext';
import { EsoPayAuthGate } from '@/esopay/auth/EsoPayAuthGate';
import { ds } from '@/esopay/theme/designSystem';

import { colors } from '@/esopay/theme/colors';

export default function BillingLayout() {
  return (
    <PaymentModalProvider>
      <EsoPayAuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: ds.color.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="pin-gate" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(pay-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="utility/[category]" />
          <Stack.Screen name="utilities" />
          <Stack.Screen name="[billId]" />
          <Stack.Screen name="pay/[billId]" />
          <Stack.Screen name="fund" options={{ presentation: 'modal' }} />
          <Stack.Screen name="invoices" />
        </Stack>
      </EsoPayAuthGate>
    </PaymentModalProvider>
  );
}


