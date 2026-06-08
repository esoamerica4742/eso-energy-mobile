import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ESOPAY_HOME_ROUTE,
  ESOPAY_LOGIN_ROUTE,
  MONITORING_HOME_ROUTE,
  MONITORING_LOGIN_ROUTE,
  type AppProduct,
} from '@/lib/navigation/productRoutes';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { selectIsLoggedIn, useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

/**
 * Routes operators to the correct product shell.
 * Monitoring always opens the fleet command deck; empty sites / Enode link are handled there.
 */
export function useCommandCenterNavigation() {
  const router = useRouter();
  const { setModule } = useAuth();
  const isMonitoringAuthenticated = useAuthStore(selectIsLoggedIn);
  const isEsoPayAuthenticated = useEsoPayAuthStore(selectEsoPayHasAccess);

  const navigateToProduct = useCallback(
    async (product: AppProduct) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (product === 'monitoring') {
        await setLastProduct('monitoring');
        setModule('inverter');
        if (!isMonitoringAuthenticated) {
          router.push(MONITORING_LOGIN_ROUTE);
          return;
        }
        router.replace(MONITORING_HOME_ROUTE);
        return;
      }

      await setLastProduct('esopay');
      setModule('esopay');
      if (!isEsoPayAuthenticated) {
        router.push(ESOPAY_LOGIN_ROUTE);
        return;
      }
      router.replace(ESOPAY_HOME_ROUTE);
    },
    [isEsoPayAuthenticated, isMonitoringAuthenticated, router, setModule],
  );

  const openSignIn = useCallback(() => {
    void Haptics.selectionAsync();
    router.push('/login');
  }, [router]);

  return { navigateToProduct, openSignIn };
}
