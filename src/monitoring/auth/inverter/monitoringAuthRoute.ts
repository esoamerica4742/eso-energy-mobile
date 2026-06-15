import type { User } from '@supabase/supabase-js';
import type { Href } from 'expo-router';
import { isMonitoringProfileComplete } from '@/lib/authProfile';
import { hasOperatorPin } from '@/lib/monitoring/operatorPin';
import { MONITORING_HOME_ROUTE } from '@/lib/navigation/productRoutes';

export type MonitoringAuthRoute =
  | '/inverter/profile'
  | '/inverter/create-pin'
  | '/inverter/unlock'
  | typeof MONITORING_HOME_ROUTE;

/** Has completed PIN setup on a prior session (server metadata flag). */
export function isReturningMonitoringUser(user: User): boolean {
  return user.user_metadata?.hasPin === true;
}

/**
 * Next inverter auth screen after OTP or when guarding a step.
 * Unlock requires a PIN stored on this device — server hasPin alone is not enough.
 */
export async function resolveMonitoringAuthRoute(user: User): Promise<MonitoringAuthRoute> {
  const hasLocalPin = await hasOperatorPin(user.id);
  const profileComplete = isMonitoringProfileComplete(user);

  if (!profileComplete) {
    return '/inverter/profile';
  }

  if (hasLocalPin) {
    return '/inverter/unlock';
  }

  return '/inverter/create-pin';
}

export function monitoringProfileHref(user: User): Href {
  return {
    pathname: '/inverter/profile',
    params: {
      email: user.email?.trim().toLowerCase() ?? '',
      module: 'inverter',
    },
  };
}

