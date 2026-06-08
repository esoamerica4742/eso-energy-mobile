import { Stack } from 'expo-router';
import { colors } from '@/theme/tokens';

export default function LinkDeviceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    />
  );
}
