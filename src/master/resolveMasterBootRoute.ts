import type { Href } from 'expo-router';
import {
  ACCESS_ROUTE,
  ESOPAY_HOME_ROUTE,
  MONITORING_HOME_ROUTE,
  ONBOARDING_ROUTE,
} from '@/lib/navigation/productRoutes';
import type { DefaultLaunchPreference } from '@/master/constants';
import { getDefaultLaunchPreference } from '@/master/launchPreference';

export function routeForLaunchPreference(
  preference: DefaultLaunchPreference,
): Href {
  if (preference === 'inverter') return MONITORING_HOME_ROUTE;
  if (preference === 'eso_pay') return ESOPAY_HOME_ROUTE;
  return ACCESS_ROUTE;
}

export async function resolveAuthenticatedBootRoute(hasSeenWelcome: boolean): Promise<Href> {
  if (!hasSeenWelcome) return ONBOARDING_ROUTE;
  const preference = await getDefaultLaunchPreference();
  return routeForLaunchPreference(preference);
}
