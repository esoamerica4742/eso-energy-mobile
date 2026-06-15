import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useAppAccess } from '@/hooks/useAppAccess';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { MasterPinLockOverlay } from '@/master/components/MasterPinLockOverlay';
import { selectMasterPinUnlocked, useMasterSessionStore } from '@/master/masterSessionStore';
import { useMasterPinLock } from '@/master/hooks/useMasterPinLock';
import { getDefaultLaunchPreference } from '@/master/launchPreference';
import { routeForLaunchPreference } from '@/master/resolveMasterBootRoute';

const PUBLIC_PREFIXES = ['/onboarding', '/auth', '/access', '/login', '/pay-auth', '/inverter'];

function isPublicPath(pathname: string | null): boolean {
  if (!pathname || pathname === '/' || pathname === '/index') return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function MasterAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppAccess();
  const esoPayAuthenticated = useEsoPayAuthStore(selectEsoPayHasAccess);
  const pinUnlocked = useMasterSessionStore(selectMasterPinUnlocked);
  const hasSession = isAuthenticated && esoPayAuthenticated;
  const userId = user?.id ?? useEsoPayAuthStore.getState().user?.id ?? '';

  useMasterPinLock();

  useEffect(() => {
    if (!hasSession || pinUnlocked || isPublicPath(pathname)) return;
    // Pin lock overlay handles UI; block navigation attempts until unlocked.
  }, [hasSession, pathname, pinUnlocked]);

  const onUnlocked = async () => {
    useMasterSessionStore.getState().setPinUnlocked(true);
    useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
    if (pathname === '/' || pathname === '/index') {
      const preference = await getDefaultLaunchPreference();
      router.replace(routeForLaunchPreference(preference));
    }
  };

  if (hasSession && !pinUnlocked && !isPublicPath(pathname) && userId) {
    return <MasterPinLockOverlay visible userId={userId} onUnlocked={() => void onUnlocked()} />;
  }

  return <>{children}</>;
}
