import type { Href } from 'expo-router';
import { ACCESS_ROUTE, ESOPAY_HOME_ROUTE } from '@/lib/navigation/productRoutes';

type NavRouter = {
  back: () => void;
  replace: (href: Href) => void;
  canGoBack: () => boolean;
};

const PAY_TABS_ROOTS = new Set(['index', 'settings', 'bills', 'intelligence']);
const PAY_TABS_OVERLAYS = new Set(['wallet', 'history']);

export function getBillingTail(segments: string[]): string[] {
  const index = segments.indexOf('billing');
  return index >= 0 ? segments.slice(index + 1) : [];
}

export function isEsoPayHome(segments: string[]): boolean {
  const tail = getBillingTail(segments);
  return tail[0] === '(pay-tabs)' && (!tail[1] || tail[1] === 'index');
}

/** Back within Eso Pay — never drops the user into Inverter Monitoring by accident. */
export function goEsoPayBack(
  router: NavRouter,
  segments: string[],
): void {
  const tail = getBillingTail(segments);

  if (tail.length === 0) {
    router.replace(ACCESS_ROUTE);
    return;
  }

  // Billing stack screens (fund, utilities, bill detail, …)
  if (tail[0] !== '(pay-tabs)') {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ESOPAY_HOME_ROUTE);
    return;
  }

  const payTab = tail[1];

  if (payTab && PAY_TABS_OVERLAYS.has(payTab)) {
    router.replace(ESOPAY_HOME_ROUTE);
    return;
  }

  if (!payTab || payTab === 'index') {
    router.replace(ACCESS_ROUTE);
    return;
  }

  if (payTab && PAY_TABS_ROOTS.has(payTab)) {
    router.replace(ESOPAY_HOME_ROUTE);
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(ACCESS_ROUTE);
}
