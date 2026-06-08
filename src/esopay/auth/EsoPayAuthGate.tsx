import { useEffect, useRef } from 'react';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { SkeletonAuthSplash } from '@/components/atoms/Skeleton';
import { ESOPAY_LOGIN_ROUTE } from '@/lib/navigation/productRoutes';
import { esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { EsoPayLoginPinGate } from '@/esopay/auth/EsoPayLoginPinGate';
import { useLoginPin } from '@/esopay/hooks/useLoginPin';

const REDIRECT_GRACE_MS = 2500;

export function EsoPayAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const navigationReady = Boolean(useRootNavigationState()?.key);

  const hasAccess = useEsoPayAuthStore(selectEsoPayHasAccess);
  const loginPinUnlocked = useEsoPayAuthStore((s) => s.loginPinUnlocked);
  const esoPayLoading = useEsoPayAuthStore((s) => s.loading);
  const esoPayHydrated = useEsoPayAuthStore((s) => s.hydrated);
  const authLoading = !esoPayHydrated || esoPayLoading;
  const { pinConfigured: loginPinConfigured, isChecking: loginPinChecking } = useLoginPin();

  const onAppEntry = !pathname || pathname === '/' || pathname === '/index';
  const isPublic = onAppEntry;

  const recoverStarted = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | undefined>();

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
        router.replace(ESOPAY_LOGIN_ROUTE);
      }
    }, REDIRECT_GRACE_MS);

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [navigationReady, authLoading, router, hasAccess, isPublic]);

  if (esoPaySupabaseConfigured && authLoading && !isPublic) {
    return <SkeletonAuthSplash />;
  }

  // Login PIN gate for Eso Pay Bills (device-local), after Eso Pay auth.
  if (
    esoPaySupabaseConfigured &&
    hasAccess &&
    !isPublic &&
    !loginPinChecking &&
    loginPinConfigured &&
    !loginPinUnlocked
  ) {
    return <EsoPayLoginPinGate />;
  }

  return <>{children}</>;
}
