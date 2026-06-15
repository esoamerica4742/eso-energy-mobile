import { useEffect, useRef } from 'react';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { SkeletonAuthSplash } from '@/components/atoms/Skeleton';
import { MASTER_SIGN_IN_ROUTE } from '@/lib/navigation/productRoutes';
import { esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import {
  selectEsoPayHasAccess,
  selectPinSessionUnlocked,
  useEsoPayAuthStore,
} from '@/esopay/auth/store';
import { selectMasterPinUnlocked, useMasterSessionStore } from '@/master/masterSessionStore';

const REDIRECT_GRACE_MS = 2500;

export function EsoPayAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const navigationReady = Boolean(useRootNavigationState()?.key);

  const hasAccess = useEsoPayAuthStore(selectEsoPayHasAccess);
  const pinSessionUnlocked = useEsoPayAuthStore(selectPinSessionUnlocked);
  const masterPinUnlocked = useMasterSessionStore(selectMasterPinUnlocked);
  const esoPayLoading = useEsoPayAuthStore((s) => s.loading);
  const esoPayHydrated = useEsoPayAuthStore((s) => s.hydrated);
  const authLoading = !esoPayHydrated || esoPayLoading;

  const onAppEntry = !pathname || pathname === '/' || pathname === '/index';
  const isPublic =
    onAppEntry ||
    pathname?.startsWith('/onboarding') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/access');

  const recoverStarted = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (masterPinUnlocked && hasAccess && !pinSessionUnlocked) {
      useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
    }
  }, [hasAccess, masterPinUnlocked, pinSessionUnlocked]);

  useEffect(() => {
    if (!navigationReady || !esoPaySupabaseConfigured || authLoading || hasAccess || isPublic) {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
        redirectTimer.current = undefined;
      }
      return;
    }

    if (!recoverStarted.current) {
      recoverStarted.current = true;
      void recoverEsoPaySession();
    }

    redirectTimer.current = setTimeout(() => {
      if (!useEsoPayAuthStore.getState().signedIn) {
        router.replace(MASTER_SIGN_IN_ROUTE);
      }
    }, REDIRECT_GRACE_MS);

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [navigationReady, authLoading, router, hasAccess, isPublic]);

  if (esoPaySupabaseConfigured && authLoading && !isPublic) {
    return <SkeletonAuthSplash />;
  }

  return <>{children}</>;
}
