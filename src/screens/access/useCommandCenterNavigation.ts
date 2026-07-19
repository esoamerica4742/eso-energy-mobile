import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MASTER_SIGN_IN_ROUTE, type AppProduct } from '@/lib/navigation/productRoutes';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { selectIsLoggedIn, useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { resolveEsoPayLaunchRoute } from '@/esopay/navigation/resolveEsoPayLaunchRoute';
import { resolveMonitoringLaunchRoute } from '@/monitoring/navigation/resolveMonitoringLaunchRoute';

/**
 * Routes operators to the correct product shell.
 * One master account — no per-product sign-in from the hub.
 */
export function useCommandCenterNavigation() {
  const router = useRouter();
  const { setModule } = useAuth();
  const isMonitoringAuthenticated = useAuthStore(selectIsLoggedIn);
  const isEsoPayAuthenticated = useEsoPayAuthStore(selectEsoPayHasAccess);

  const navigateToProduct = useCallback(
    async (product: AppProduct) => {
      const authenticated =
        product === 'monitoring' ? isMonitoringAuthenticated : isEsoPayAuthenticated;

      if (!authenticated) {
        router.replace(MASTER_SIGN_IN_ROUTE);
        return;
      }

      await setLastProduct(product);
      setModule(product === 'esopay' ? 'esopay' : 'inverter');

      const userId = useEsoPayAuthStore.getState().user?.id;
      if (product === 'monitoring') {
        router.replace(await resolveMonitoringLaunchRoute(useAuthStore.getState().user));
        return;
      }

      router.replace(await resolveEsoPayLaunchRoute(userId));
    },
    [isEsoPayAuthenticated, isMonitoringAuthenticated, router, setModule],
  );

  const signInToProduct = useCallback(async () => {
    await Haptics.selectionAsync();
    router.push(MASTER_SIGN_IN_ROUTE);
  }, [router]);

  return { navigateToProduct, signInToProduct, openSignIn: signInToProduct };
}
