import type { Href } from 'expo-router';
import {
  MASTER_SIGN_IN_ROUTE,
  productHomeRoute,
  type AppProduct,
} from '@/lib/navigation/productRoutes';
import { setLastProduct } from '@/lib/navigation/lastProduct';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import { resolveEsoPayLaunchRoute } from '@/esopay/navigation/resolveEsoPayLaunchRoute';
import { resolveMonitoringLaunchRoute } from '@/monitoring/navigation/resolveMonitoringLaunchRoute';
import { selectIsLoggedIn, useAuthStore } from '@/stores/authStore';

type NavRouter = {
  replace: (href: Href) => void;
};

/** Switch command center without leaving the other product on the back stack. */
export function navigateToProductHome(
  router: NavRouter,
  product: AppProduct,
): void {
  void (async () => {
    await setLastProduct(product);

    if (product === 'monitoring') {
      const monitoringOk = selectIsLoggedIn(useAuthStore.getState());
      if (!monitoringOk) {
        router.replace(MASTER_SIGN_IN_ROUTE);
        return;
      }
      router.replace(await resolveMonitoringLaunchRoute(useAuthStore.getState().user));
      return;
    }

    // Heal Pay from unified / Monitoring session before access check.
    await recoverEsoPaySession();
    const payStore = useEsoPayAuthStore.getState();
    const payOk = selectEsoPayHasAccess(payStore) || selectIsLoggedIn(useAuthStore.getState());
    if (!payOk) {
      router.replace(MASTER_SIGN_IN_ROUTE);
      return;
    }

    if (!payStore.signedIn && useAuthStore.getState().session) {
      const session = useAuthStore.getState().session!;
      payStore.lockSignedIn();
      payStore.setSession(session);
    }

    const userId =
      useEsoPayAuthStore.getState().user?.id ?? useAuthStore.getState().user?.id;
    router.replace(await resolveEsoPayLaunchRoute(userId));
  })();
}

/** Sync helper — prefer when you already know the destination home route. */
export function replaceProductHome(
  router: NavRouter,
  product: AppProduct,
): void {
  void setLastProduct(product);
  router.replace(productHomeRoute(product));
}
