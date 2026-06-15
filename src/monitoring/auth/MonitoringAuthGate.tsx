import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { SkeletonAuthSplash } from '@/components/atoms/Skeleton';
import { useAppAccess } from '@/hooks/useAppAccess';
import { MONITORING_UNLOCK_ROUTE } from '@/lib/navigation/productRoutes';
import { resolveMonitoringAuthRoute } from '@/monitoring/auth/inverter/monitoringAuthRoute';
import {
  isMonitoringPinUnlocked,
  subscribeMonitoringPinSession,
} from '@/monitoring/auth/monitoringPinSession';
import { useAuthStore } from '@/stores/authStore';

function isBillingRoute(segments: string[], pathname: string | null) {
  if (segments[0] === '(tabs)' && segments[1] === 'billing') return true;
  return Boolean(pathname?.includes('/billing'));
}

function isUnlockPath(pathname: string | null): boolean {
  return Boolean(pathname?.includes('/inverter/unlock'));
}

function useMonitoringPinUnlocked(): boolean {
  return useSyncExternalStore(
    subscribeMonitoringPinSession,
    isMonitoringPinUnlocked,
    () => false,
  );
}

export function MonitoringAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const navigationReady = Boolean(useRootNavigationState()?.key);
  const { isAuthenticated, loading } = useAppAccess();
  const userId = useAuthStore((s) => s.user?.id);
  const pinSessionUnlocked = useMonitoringPinUnlocked();

  const onAppEntry = !pathname || pathname === '/' || pathname === '/index';
  const onInverterAuth = segments[0] === 'inverter';
  const onAccessFlow =
    segments[0] === 'access' ||
    segments[0] === 'auth' ||
    segments[0] === 'login' ||
    segments[0] === 'pay-auth' ||
    segments[0] === 'onboarding';
  const onBilling = isBillingRoute(segments, pathname);
  const isPublic = onAppEntry || onInverterAuth || onAccessFlow || onBilling;
  const onUnlock = isUnlockPath(pathname);

  const [pinChecking, setPinChecking] = useState(false);
  const pinRedirectStarted = useRef(false);

  // Reset redirect guard only when the session is locked again (cold start / sign-out).
  useEffect(() => {
    if (!pinSessionUnlocked) {
      pinRedirectStarted.current = false;
    }
  }, [pinSessionUnlocked]);

  useEffect(() => {
    if (pinSessionUnlocked) {
      setPinChecking(false);
      return;
    }

    if (!navigationReady || loading || !isAuthenticated || isPublic || onUnlock) {
      return;
    }

    if (pinRedirectStarted.current) return;
    pinRedirectStarted.current = true;
    setPinChecking(true);

    void (async () => {
      const activeUser = useAuthStore.getState().user;
      if (!activeUser) {
        setPinChecking(false);
        pinRedirectStarted.current = false;
        return;
      }

      const next = await resolveMonitoringAuthRoute(activeUser);
      setPinChecking(false);

      if (next === '/inverter/unlock') {
        if (!isMonitoringPinUnlocked()) {
          router.replace(MONITORING_UNLOCK_ROUTE);
        }
        return;
      }

      router.replace(next);
    })();
  }, [
    isAuthenticated,
    isPublic,
    loading,
    navigationReady,
    onUnlock,
    pinSessionUnlocked,
    router,
    userId,
  ]);

  // Unlocked for this app session — never block or re-redirect.
  if (pinSessionUnlocked) {
    return <>{children}</>;
  }

  const showPinWall = isAuthenticated && !isPublic && !onUnlock && pinChecking;

  if (showPinWall) {
    return <SkeletonAuthSplash />;
  }

  return <>{children}</>;
}

