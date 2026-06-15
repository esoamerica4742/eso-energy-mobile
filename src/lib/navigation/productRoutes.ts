import type { Href } from 'expo-router';

/** Platform picker — user chooses Monitoring vs Eso Pay. */
export const ACCESS_ROUTE = '/access' as Href;

export const ONBOARDING_ROUTE = '/onboarding' as Href;

/** ESO Inverter Monitoring command dashboard (Monitor tab). */
export const MONITORING_HOME_ROUTE = '/(tabs)' as Href;

/** Eso Pay wallet home (gold bottom nav). */
export const ESOPAY_HOME_ROUTE = '/(tabs)/billing/(pay-tabs)' as Href;

export const MASTER_SIGN_IN_ROUTE = '/auth/sign-in' as Href;
export const MASTER_REGISTER_ROUTE = '/auth/register' as Href;

export const MONITORING_LOGIN_ROUTE = {
  pathname: '/login',
  params: { module: 'inverter' },
} as Href;

export const ESOPAY_LOGIN_ROUTE = {
  pathname: '/login',
  params: { module: 'esopay' },
} as Href;

/** Eso Pay transaction PIN gate (billing stack). */
export const ESOPAY_PIN_GATE_ROUTE = '/(tabs)/billing/pin-gate' as Href;

export const ESOPAY_PIN_SETUP_ROUTE = {
  pathname: '/auth/esopay-pin-setup',
  params: {},
} as Href;

/** Monitoring operator PIN unlock screen. */
export const MONITORING_UNLOCK_ROUTE = '/inverter/unlock' as Href;

export type AppProduct = 'monitoring' | 'esopay';

export function productHomeRoute(product: AppProduct): Href {
  return product === 'esopay' ? ESOPAY_HOME_ROUTE : MONITORING_HOME_ROUTE;
}
