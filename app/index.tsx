import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { MobileBootScreen } from '@/components/MobileBootScreen';
import { useAppAccess } from '@/hooks/useAppAccess';
import { getOnboardingComplete } from '@/lib/onboardingStorage';
import { getLastProduct } from '@/lib/navigation/lastProduct';
import {
  ACCESS_ROUTE,
  ESOPAY_HOME_ROUTE,
  MONITORING_HOME_ROUTE,
  ONBOARDING_ROUTE,
} from '@/lib/navigation/productRoutes';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';

/** Boot router — sends users to the correct product home, never mixing dashboards. */
export default function AppEntryScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: monitoringLoading } = useAppAccess();
  const esoPayAuthenticated = useEsoPayAuthStore(selectEsoPayHasAccess);
  const esoPayLoading = useEsoPayAuthStore((s) => s.loading);
  const esoPayHydrated = useEsoPayAuthStore((s) => s.hydrated);
  const [routed, setRouted] = useState(false);

  useEffect(() => {
    if (routed || monitoringLoading || esoPayLoading || !esoPayHydrated) return;

    let cancelled = false;

    void (async () => {
      const onboardingDone = await getOnboardingComplete();
      if (cancelled) return;

      if (!onboardingDone) {
        router.replace(ONBOARDING_ROUTE);
        setRouted(true);
        return;
      }

      const lastProduct = await getLastProduct();

      if (esoPayAuthenticated && !isAuthenticated) {
        router.replace(ESOPAY_HOME_ROUTE);
        setRouted(true);
        return;
      }

      if (isAuthenticated && !esoPayAuthenticated) {
        router.replace(MONITORING_HOME_ROUTE);
        setRouted(true);
        return;
      }

      if (esoPayAuthenticated && isAuthenticated) {
        if (lastProduct === 'esopay') {
          router.replace(ESOPAY_HOME_ROUTE);
        } else if (lastProduct === 'monitoring') {
          router.replace(MONITORING_HOME_ROUTE);
        } else {
          router.replace(ACCESS_ROUTE);
        }
        setRouted(true);
        return;
      }

      router.replace(ACCESS_ROUTE);
      setRouted(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    esoPayAuthenticated,
    esoPayHydrated,
    esoPayLoading,
    isAuthenticated,
    monitoringLoading,
    routed,
    router,
  ]);

  return <MobileBootScreen />;
}
