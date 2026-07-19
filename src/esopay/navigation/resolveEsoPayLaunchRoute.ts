import type { Href } from 'expo-router';
import {
  ESOPAY_HOME_ROUTE,
  MASTER_PIN_SETUP_ROUTE,
  MASTER_SIGN_IN_ROUTE,
} from '@/lib/navigation/productRoutes';
import { hasMasterPin } from '@/master/masterPin';

/** First Eso Pay screen after hub — home when PIN exists, else setup. */
export async function resolveEsoPayLaunchRoute(userId: string | undefined): Promise<Href> {
  if (!userId) return MASTER_SIGN_IN_ROUTE;
  if (!(await hasMasterPin(userId))) return MASTER_PIN_SETUP_ROUTE;
  return ESOPAY_HOME_ROUTE;
}
