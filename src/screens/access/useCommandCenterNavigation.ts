import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ESOPAY_LOGIN_ROUTE,
  MONITORING_LOGIN_ROUTE,
  type AppProduct,
} from '@/lib/navigation/productRoutes';
import { resolveMonitoringLaunchRoute } from '@/monitoring/navigation/resolveMonitoringLaunchRoute';
import { resolveEsoPayLaunchRoute } from '@/esopay/navigation/resolveEsoPayLaunchRoute';
import { getLastProduct, setLastProduct } from '@/lib/navigation/lastProduct';
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
      if (product === 'monitoring') {
        await setLastProduct('monitoring');
        setModule('inverter');
        if (!isMonitoringAuthenticated) {
          router.push(MONITORING_LOGIN_ROUTE);
          return;
        }
        const monitoringUser = useAuthStore.getState().user;
        router.replace(await resolveMonitoringLaunchRoute(monitoringUser));
        return;
      }

      await setLastProduct('esopay');
      setModule('esopay');
      if (!isEsoPayAuthenticated) {
        router.push(ESOPAY_LOGIN_ROUTE);
        return;
      }
      const userId = useEsoPayAuthStore.getState().user?.id;
      useEsoPayAuthStore.getState().setPinSessionUnlocked(false);
      router.replace(await resolveEsoPayLaunchRoute(userId));
    },
    [isEsoPayAuthenticated, isMonitoringAuthenticated, router, setModule],
  );

  const signInToProduct = useCallback(
    async (product: AppProduct) => {
      await Haptics.selectionAsync();
      await setLastProduct(product);
      setModule(product === 'esopay' ? 'esopay' : 'inverter');
      router.push(product === 'esopay' ? ESOPAY_LOGIN_ROUTE : MONITORING_LOGIN_ROUTE);
    },
    [router, setModule],
  );

  const openSignIn = useCallback(async () => {
    const last = await getLastProduct();
    if (last) {
      await signInToProduct(last);
      return;
    }
    await signInToProduct('esopay');
  }, [signInToProduct]);

  return { navigateToProduct, signInToProduct, openSignIn };
}
