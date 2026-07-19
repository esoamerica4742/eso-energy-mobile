import type { User } from '@supabase/supabase-js';
import type { Href } from 'expo-router';
import { getCurrentUser } from '@/lib/authProfile';
import {
  MASTER_PIN_SETUP_ROUTE,
  MASTER_SIGN_IN_ROUTE,
  MONITORING_HOME_ROUTE,
} from '@/lib/navigation/productRoutes';
import { hasMasterPin } from '@/master/masterPin';

/** First monitoring screen after hub — home when PIN exists, else setup. */
export async function resolveMonitoringLaunchRoute(user?: User | null): Promise<Href> {
  const activeUser = user ?? (await getCurrentUser());
  if (!activeUser?.id) return MASTER_SIGN_IN_ROUTE;
  if (!(await hasMasterPin(activeUser.id))) return MASTER_PIN_SETUP_ROUTE;
  return MONITORING_HOME_ROUTE;
}
