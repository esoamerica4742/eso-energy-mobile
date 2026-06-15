import type { Href } from 'expo-router';
import {
  ESOPAY_LOGIN_ROUTE,
  ESOPAY_PIN_GATE_ROUTE,
  ESOPAY_PIN_SETUP_ROUTE,
} from '@/lib/navigation/productRoutes';
import { isTransactionPinConfigured } from '@/esopay/lib/transactionPinStatus';

/** First screen after boot / sign-in — PIN gate, setup, or login. */
export async function resolveEsoPayLaunchRoute(userId: string | undefined): Promise<Href> {
  if (!userId) return ESOPAY_LOGIN_ROUTE;

  const pinReady = await isTransactionPinConfigured(userId);
  if (!pinReady) {
    return {
      pathname: ESOPAY_PIN_SETUP_ROUTE.pathname,
      params: { ...ESOPAY_PIN_SETUP_ROUTE.params, returning: '1' },
    } as Href;
  }

  return ESOPAY_PIN_GATE_ROUTE;
}
