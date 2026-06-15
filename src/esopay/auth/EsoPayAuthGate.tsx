import { useEffect, useRef } from 'react';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { SkeletonAuthSplash } from '@/components/atoms/Skeleton';
import { ESOPAY_LOGIN_ROUTE, ESOPAY_PIN_GATE_ROUTE } from '@/lib/navigation/productRoutes';
import { esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import {
  selectEsoPayHasAccess,
  selectPinSessionUnlocked,
  useEsoPayAuthStore,
} from '@/esopay/auth/store';
import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';

const REDIRECT_GRACE_MS = 2500;

function isPinGatePath(pathname: string | null): boolean {
  return Boolean(pathname?.includes('pin-gate'));
}

export function EsoPayAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const navigationReady = Boolean(useRootNavigationState()?.key);

  const hasAccess = useEsoPayAuthStore(selectEsoPayHasAccess);
  const pinSessionUnlocked = useEsoPayAuthStore(selectPinSessionUnlocked);
  const esoPayLoading = useEsoPayAuthStore((s) => s.loading);
  const esoPayHydrated = useEsoPayAuthStore((s) => s.hydrated);
  const authLoading = !esoPayHydrated || esoPayLoading;
  const { isChecking: pinChecking } = useTransactionPin();

  const onAppEntry = !pathname || pathname === '/' || pathname === '/index';
  const isPublic = onAppEntry;
  const onPinGate = isPinGatePath(pathname);
  const isPinBypassRoute =
    pathname?.startsWith('/billing/settings') ||
    pathname?.startsWith('/auth/esopay-pin-setup') ||
    pathname?.startsWith('/auth/verify') ||
    pathname?.startsWith('/auth/register');

  const recoverStarted = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pinRedirectStarted = useRef(false);

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

  useEffect(() => {
    pinRedirectStarted.current = false;
  }, [pathname]);

  useEffect(() => {
    if (
      !navigationReady ||
      !esoPaySupabaseConfigured ||
      authLoading ||
      pinChecking ||
      !hasAccess ||
      isPublic ||
      pinSessionUnlocked ||
      isPinBypassRoute ||
      onPinGate
    ) {
      return;
    }

    if (pinRedirectStarted.current) return;
    pinRedirectStarted.current = true;
    router.replace(ESOPAY_PIN_GATE_ROUTE);
  }, [
    authLoading,
    hasAccess,
    isPinBypassRoute,
    isPublic,
    navigationReady,
    onPinGate,
    pinChecking,
    pinSessionUnlocked,
    router,
  ]);

  if (esoPaySupabaseConfigured && authLoading && !isPublic) {
    return <SkeletonAuthSplash />;
  }

  if (
    esoPaySupabaseConfigured &&
    hasAccess &&
    !isPublic &&
    !pinSessionUnlocked &&
    !isPinBypassRoute &&
    !onPinGate
  ) {
    return <SkeletonAuthSplash />;
  }

  return <>{children}</>;
}
