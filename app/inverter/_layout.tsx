import { Stack } from 'expo-router';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

export default function InverterAuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: INVERTER_AUTH.BG_PRIMARY },
        animation: 'slide_from_right',
      }}
    />
  );
}
