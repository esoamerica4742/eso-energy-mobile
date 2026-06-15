import type { User } from '@supabase/supabase-js';
import type { Href } from 'expo-router';
import { getCurrentUser } from '@/lib/authProfile';
import { MONITORING_HOME_ROUTE, MONITORING_LOGIN_ROUTE } from '@/lib/navigation/productRoutes';
import { resolveMonitoringAuthRoute } from '@/monitoring/auth/inverter/monitoringAuthRoute';
import { isMonitoringPinUnlocked } from '@/monitoring/auth/monitoringPinSession';

/** First monitoring screen after access picker or app resume — unlock, onboarding, or home. */
export async function resolveMonitoringLaunchRoute(user?: User | null): Promise<Href> {
  const activeUser = user ?? (await getCurrentUser());
  if (!activeUser) return MONITORING_LOGIN_ROUTE;

  const next = await resolveMonitoringAuthRoute(activeUser);
  if (next === '/inverter/unlock' && isMonitoringPinUnlocked()) {
    return MONITORING_HOME_ROUTE;
  }
  return next;
}
