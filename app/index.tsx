import { useCallback, useEffect, useState } from 'react';
import { useRootNavigationState, useRouter } from 'expo-router';
import { MobileBootScreen } from '@/components/MobileBootScreen';
import { useAppAccess } from '@/hooks/useAppAccess';
import { getOnboardingComplete } from '@/lib/onboardingStorage';
import {
  MASTER_SIGN_IN_ROUTE,
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
  const navigationReady = Boolean(useRootNavigationState()?.key);
  const { isAuthenticated, loading: monitoringLoading, user, isDemoMode } = useAppAccess();
  const esoPayAuthenticated = useEsoPayAuthStore(selectEsoPayHasAccess);
  const esoPayLoading = useEsoPayAuthStore((s) => s.loading);
  const esoPayHydrated = useEsoPayAuthStore((s) => s.hydrated);
  const pinUnlocked = useMasterSessionStore(selectMasterPinUnlocked);
  const [showPinLock, setShowPinLock] = useState(false);

  // Local state — intentionally resets on every mount so Fast Refresh / Metro
  // reconnects never leave the boot screen permanently stuck.
  const [bootstrapped, setBootstrapped] = useState(false);

  // Master session = one Supabase auth. Either store is enough (unified write may lag).
  const sessionReady =
    (!monitoringLoading || isDemoMode || isAuthenticated) &&
    (esoPayHydrated || isAuthenticated) &&
    (!esoPayLoading || isAuthenticated);
  const hasSession = isAuthenticated || esoPayAuthenticated;
  const userId = user?.id ?? useEsoPayAuthStore.getState().user?.id ?? '';

  // Hard safety-net: if sessionReady never clears within 10 s, force navigation.
  useEffect(() => {
    if (sessionReady || bootstrapped) return;
    const timer = setTimeout(() => {
      if (__DEV__) {
        console.warn('[boot] sessionReady timeout — forcing navigation');
      }
      setBootstrapped(true);
    }, 10_000);
    return () => clearTimeout(timer);
  }, [sessionReady, bootstrapped]);

  useEffect(() => {
    if (!navigationReady || !sessionReady || bootstrapped) return;

    let cancelled = false;

    void (async () => {
      const seenWelcome = await getOnboardingComplete();
      if (cancelled) return;

      if (!hasSession) {
        // If the user has been through onboarding before, go straight to sign-in.
        // First-time visitors see the full onboarding/splash experience.
        router.replace(seenWelcome ? MASTER_SIGN_IN_ROUTE : ONBOARDING_ROUTE);
        if (!cancelled) setBootstrapped(true);
        return;
      }

      if (!pinUnlocked) {
        if (!cancelled) {
          setShowPinLock(true);
          setBootstrapped(true);
        }
        return;
      }

      const preference = await getDefaultLaunchPreference();
      if (cancelled) return;
      router.replace(routeForLaunchPreference(preference));
      setBootstrapped(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, hasSession, navigationReady, pinUnlocked, router, sessionReady]);

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
      <MasterPinLockOverlay
        visible
        userId={userId}
        userEmail={user?.email ?? useEsoPayAuthStore.getState().user?.email}
        onUnlocked={() => void onPinUnlocked()}
      />
    );
  }

  return <MobileBootScreen message="Opening your workspace…" />;
}
