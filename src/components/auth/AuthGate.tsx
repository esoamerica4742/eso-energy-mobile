import { useEffect, useRef } from 'react';

import { SkeletonAuthSplash } from '@/components/atoms/Skeleton';

import { usePathname, useRootNavigationState, useRouter, useSegments, type Href } from 'expo-router';

import { useAppAccess } from '@/hooks/useAppAccess';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { useAuth } from '@/hooks/useAuth';
import { supabaseConfigured } from '@/lib/supabase';

const BILLING_REDIRECT_GRACE_MS = 2500;

function isBillingRoute(segments: string[], pathname: string | null) {
  if (segments[0] === '(tabs)' && segments[1] === 'billing') return true;
  return Boolean(pathname?.includes('/billing'));
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, isAuthenticated, isDemoMode } = useAppAccess();
  const esoPayHasAccess = useEsoPayAuthStore(selectEsoPayHasAccess);
  const esoPayLoading = useEsoPayAuthStore((s) => s.loading);
  const esoPayHydrated = useEsoPayAuthStore((s) => s.hydrated);

  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const navigationReady = Boolean(useRootNavigationState()?.key);

  const onLoginScreen = segments[0] === 'login';
  const onAppEntry = !pathname || pathname === '/' || pathname === '/index';
  const onOnboarding = segments[0] === 'onboarding';
  const onInverterAuth = segments[0] === 'inverter';
  const onAccessFlow = segments[0] === 'access' || segments[0] === 'auth' || onInverterAuth;
  const onBilling = isBillingRoute(segments, pathname);
  const onLinkFlow =
    segments[0] === 'link-device' ||
    segments.join('/') === 'link-device/callback' ||
    segments[0] === 'link-solarman';
  const isPublicRoute =
    onLoginScreen || onLinkFlow || onAppEntry || onAccessFlow || onOnboarding;
  const billingAuthorized = onBilling && esoPayHasAccess;
  const { module: authFlowModule } = useAuth();

  const billingRedirectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!navigationReady || !supabaseConfigured) return;
    const billingAuthLoading = onBilling && (esoPayLoading || !esoPayHydrated);
    const authLoading = onBilling ? billingAuthLoading : loading;
    if (authLoading) return;

    if (!isAuthenticated && !isPublicRoute && !billingAuthorized) {
      router.replace('/access' as Href);
      return;
    }

    if (onBilling && esoPayHydrated && !billingAuthorized) {
      void recoverEsoPaySession();
      if (billingRedirectTimer.current) clearTimeout(billingRedirectTimer.current);
      billingRedirectTimer.current = setTimeout(() => {
        if (!useEsoPayAuthStore.getState().signedIn) {
          router.replace({ pathname: '/login', params: { module: 'esopay' } } as Href);
        }
      }, BILLING_REDIRECT_GRACE_MS);
    } else if (billingRedirectTimer.current) {
      clearTimeout(billingRedirectTimer.current);
      billingRedirectTimer.current = undefined;
    }

    if (session && onLoginScreen && authFlowModule !== 'esopay') {
      router.replace('/access' as Href);
    }
  }, [
    navigationReady,
    session,
    loading,
    esoPayLoading,
    esoPayHydrated,
    esoPayHasAccess,
    isAuthenticated,
    isPublicRoute,
    billingAuthorized,
    onBilling,
    onLoginScreen,
    authFlowModule,
    router,
  ]);

  useEffect(
    () => () => {
      if (billingRedirectTimer.current) clearTimeout(billingRedirectTimer.current);
    },
    [],
  );

  const gateLoading = onBilling ? esoPayLoading || !esoPayHydrated : loading;

  if (
    supabaseConfigured &&
    gateLoading &&
    !isDemoMode &&
    !isPublicRoute &&
    !(onBilling && esoPayHasAccess)
  ) {
    return <SkeletonAuthSplash />;
  }

  return <>{children}</>;
}
