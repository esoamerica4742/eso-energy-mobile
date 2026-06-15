import { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { MobileBootScreen } from '@/components/MobileBootScreen';
import { useAppAccess } from '@/hooks/useAppAccess';
import { getOnboardingComplete } from '@/lib/onboardingStorage';
import {
  ONBOARDING_ROUTE,
} from '@/lib/navigation/productRoutes';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { MasterPinLockOverlay } from '@/master/components/MasterPinLockOverlay';
import { selectMasterPinUnlocked, useMasterSessionStore } from '@/master/masterSessionStore';
import { getDefaultLaunchPreference } from '@/master/launchPreference';
import { routeForLaunchPreference } from '@/master/resolveMasterBootRoute';

/** Boot router — unified master session, PIN lock, and launch preference. */
export default function AppEntryScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: monitoringLoading, user } = useAppAccess();
  const esoPayAuthenticated = useEsoPayAuthStore(selectEsoPayHasAccess);
  const esoPayLoading = useEsoPayAuthStore((s) => s.loading);
  const esoPayHydrated = useEsoPayAuthStore((s) => s.hydrated);
  const pinUnlocked = useMasterSessionStore(selectMasterPinUnlocked);
  const bootstrapped = useMasterSessionStore((s) => s.bootstrapped);
  const setBootstrapped = useMasterSessionStore((s) => s.setBootstrapped);
  const [showPinLock, setShowPinLock] = useState(false);

  const sessionReady = !monitoringLoading && !esoPayLoading && esoPayHydrated;
  const hasSession = isAuthenticated && esoPayAuthenticated;
  const userId = user?.id ?? useEsoPayAuthStore.getState().user?.id ?? '';

  useEffect(() => {
    if (!sessionReady || bootstrapped) return;

    let cancelled = false;

    void (async () => {
      const seenWelcome = await getOnboardingComplete();
      if (cancelled) return;

      if (!hasSession) {
        router.replace(seenWelcome ? ONBOARDING_ROUTE : ONBOARDING_ROUTE);
        setBootstrapped(true);
        return;
      }

      if (!pinUnlocked) {
        setShowPinLock(true);
        setBootstrapped(true);
        return;
      }

      const preference = await getDefaultLaunchPreference();
      router.replace(routeForLaunchPreference(preference));
      setBootstrapped(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, hasSession, pinUnlocked, router, sessionReady, setBootstrapped]);

  const onPinUnlocked = useCallback(async () => {
    setShowPinLock(false);
    const preference = await getDefaultLaunchPreference();
    router.replace(routeForLaunchPreference(preference));
  }, [router]);

  if (!sessionReady || !bootstrapped) {
    return <MobileBootScreen />;
  }

  if (showPinLock && hasSession && userId) {
    return (
      <MasterPinLockOverlay visible userId={userId} onUnlocked={() => void onPinUnlocked()} />
    );
  }

  return <MobileBootScreen message="Opening your workspace…" />;
}
