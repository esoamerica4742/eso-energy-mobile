import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';
import { useFonts } from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { EsoPayHostBridge } from '@/esopay/context/EsoPayHostContext';
import { EnodeToastProvider } from '@/providers/EnodeToastProvider';
import { EnterpriseRealtimeProvider } from '@/providers/EnterpriseRealtimeProvider';
import { AuthGate } from '@/components/auth/AuthGate';
import { MasterAuthGate } from '@/master/components/MasterAuthGate';
import { MonitoringBootstraps } from '@/components/auth/MonitoringBootstraps';
import { DemoModeProvider } from '@/providers/DemoModeProvider';
import { AuthFlowProvider } from '../src/hooks/useAuth';
import { GOLD } from '@/theme/colors';
import { colors } from '@/theme/tokens';
import { migrateLegacySensitiveStorage } from '@/lib/secureVault';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { appQueryClient } from '@/lib/queryClient';
import { DataPrefetchBootstrap } from '@/components/cache/DataPrefetchBootstrap';
import { AppPortalHost } from '@/components/primitives/PortalRoot';
import { MotionPrefsBootstrap } from '@/components/auth/MotionPrefsBootstrap';
import { EsoPayAuthProvider } from '@/esopay/auth/EsoPayAuthProvider';
import { applyGlobalInterFontDefaults } from '@/theme/bootstrapFonts';
import { INTER_FONT_MAP } from '@/theme/fonts';

// Disable all yellow banner notifications on the device UI completely
LogBox.ignoreAllLogs(true);

SplashScreen.preventAutoHideAsync().catch(() => {
  // If splash lock fails, still render — never leave a blank white screen.
});

const BOOT_BG = '#020617';
const FONT_BOOT_TIMEOUT_MS = 8000;

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <RootLayoutInner />
    </AppErrorBoundary>
  );
}

function RootLayoutInner() {
  const [fontBootTimedOut, setFontBootTimedOut] = useState(false);
  const [fontsLoaded, fontError] = useFonts(INTER_FONT_MAP);

  const fontsReady = fontsLoaded || Boolean(fontError) || fontBootTimedOut;

  useEffect(() => {
    if (fontError && __DEV__) {
      console.debug('[fonts] Failed to load custom fonts:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (!fontsReady) return;
    applyGlobalInterFontDefaults();
    void SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady]);

  useEffect(() => {
    if (fontsReady) return;
    const timer = setTimeout(() => {
      if (__DEV__) {
        console.debug('[fonts] Boot timeout — continuing with system fonts');
      }
      setFontBootTimedOut(true);
    }, FONT_BOOT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [fontsReady]);

  useEffect(() => {
    void migrateLegacySensitiveStorage();
  }, []);

  if (!fontsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: BOOT_BG, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: BOOT_BG }}>
      <QueryClientProvider client={appQueryClient}>
        <EnodeToastProvider>
          <EnterpriseRealtimeProvider>
            <AuthFlowProvider>
            <DemoModeProvider>
            <EsoPayHostBridge>
            <EsoPayAuthProvider>
            <MonitoringBootstraps />
            <MotionPrefsBootstrap />
            <PushNotificationsBootstrap />
            <AppPortalHost />
            <AuthGate>
            <MasterAuthGate>
              <BottomSheetModalProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }}>
                <Stack.Screen name="index" options={{ animation: 'fade' }} />
                <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
                <Stack.Screen name="access" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="auth" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="login" options={{ animation: 'fade' }} />
                <Stack.Screen name="pay-auth" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="link-device" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="link-solarman" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="site/[id]" options={{ animation: 'slide_from_right' }} />
              </Stack>
              </BottomSheetModalProvider>
            </MasterAuthGate>
            </AuthGate>
            </EsoPayAuthProvider>
            </EsoPayHostBridge>
            </DemoModeProvider>
            </AuthFlowProvider>
          </EnterpriseRealtimeProvider>
        </EnodeToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function PushNotificationsBootstrap() {
  usePushNotifications();
  return null;
}
