import type { Href } from 'expo-router';

/** Platform picker — user chooses Monitoring vs Eso Pay. */
export const ACCESS_ROUTE = '/access' as Href;

export const ONBOARDING_ROUTE = '/onboarding' as Href;

/** ESO Inverter Monitoring command dashboard (Monitor tab). */
export const MONITORING_HOME_ROUTE = '/(tabs)' as Href;

/** Eso Pay Bills wallet home (gold bottom nav). */
export const ESOPAY_HOME_ROUTE = '/(tabs)/billing/(pay-tabs)' as Href;

export const MONITORING_LOGIN_ROUTE = {
  pathname: '/login',
  params: { module: 'inverter' },
} as Href;

export const ESOPAY_LOGIN_ROUTE = {
  pathname: '/login',
  params: { module: 'esopay' },
} as Href;

export type AppProduct = 'monitoring' | 'esopay';

export function productHomeRoute(product: AppProduct): Href {
  return product === 'esopay' ? ESOPAY_HOME_ROUTE : MONITORING_HOME_ROUTE;
}
