import { useEffect } from 'react';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useAppAccess } from '@/hooks/useAppAccess';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { MasterPinLockOverlay } from '@/master/components/MasterPinLockOverlay';
import { selectMasterPinUnlocked, useMasterSessionStore } from '@/master/masterSessionStore';
import { useMasterPinLock } from '@/master/hooks/useMasterPinLock';
import { getDefaultLaunchPreference } from '@/master/launchPreference';
import { routeForLaunchPreference } from '@/master/resolveMasterBootRoute';
import { hasMasterPin } from '@/master/masterPin';
import { MASTER_PIN_SETUP_ROUTE } from '@/lib/navigation/productRoutes';

const PUBLIC_PREFIXES = ['/onboarding', '/auth', '/access'];

function isPublicPath(pathname: string | null): boolean {
  if (!pathname || pathname === '/' || pathname === '/index') return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function MasterAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const navigationReady = Boolean(useRootNavigationState()?.key);
  const { isAuthenticated, user } = useAppAccess();
  const esoPayAuthenticated = useEsoPayAuthStore(selectEsoPayHasAccess);
  const pinUnlocked = useMasterSessionStore(selectMasterPinUnlocked);
  // One master session — either store after OTP is enough.
  const hasSession = isAuthenticated || esoPayAuthenticated;
  const userId = user?.id ?? useEsoPayAuthStore.getState().user?.id ?? '';
  const userEmail = user?.email ?? useEsoPayAuthStore.getState().user?.email ?? null;

  useMasterPinLock();

  useEffect(() => {
    if (!navigationReady || !hasSession || pinUnlocked || !userId || isPublicPath(pathname)) {
      return;
    }

    let alive = true;
    void hasMasterPin(userId).then((configured) => {
      if (!alive || configured || pathname?.startsWith('/auth/pin-setup')) return;
      router.replace(MASTER_PIN_SETUP_ROUTE);
    });

    return () => {
      alive = false;
    };
  }, [hasSession, navigationReady, pathname, pinUnlocked, router, userId]);

  const onUnlocked = async () => {
    useMasterSessionStore.getState().setPinUnlocked(true);
    useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
    if (pathname === '/' || pathname === '/index') {
      const preference = await getDefaultLaunchPreference();
      if (navigationReady) {
        router.replace(routeForLaunchPreference(preference));
      }
    }
  };

  if (hasSession && !pinUnlocked && !isPublicPath(pathname) && userId) {
    return (
      <MasterPinLockOverlay
        visible
        userId={userId}
        userEmail={userEmail}
        onUnlocked={() => void onUnlocked()}
      />
    );
  }

  return <>{children}</>;
}
