import { Stack } from 'expo-router';
import { C } from '../../src/theme/authTheme';

export default function AuthStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.DARK_1 },
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="register" />
      <Stack.Screen
        name="welcome"
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
