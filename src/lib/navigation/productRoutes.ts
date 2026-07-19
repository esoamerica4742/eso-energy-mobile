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
export const MASTER_PIN_SETUP_ROUTE = '/auth/pin-setup' as Href;

/** @deprecated Use MASTER_SIGN_IN_ROUTE */
export const MONITORING_LOGIN_ROUTE = MASTER_SIGN_IN_ROUTE;

/** @deprecated Use MASTER_SIGN_IN_ROUTE */
export const ESOPAY_LOGIN_ROUTE = MASTER_SIGN_IN_ROUTE;

/** @deprecated Master PIN setup replaces per-product PIN setup */
export const ESOPAY_PIN_SETUP_ROUTE = MASTER_PIN_SETUP_ROUTE;

/** @deprecated Master lock replaces billing pin-gate */
export const ESOPAY_PIN_GATE_ROUTE = ESOPAY_HOME_ROUTE;

/** @deprecated Master lock replaces inverter unlock */
export const MONITORING_UNLOCK_ROUTE = ONBOARDING_ROUTE;

export type AppProduct = 'monitoring' | 'esopay';

export function productHomeRoute(product: AppProduct): Href {
  return product === 'esopay' ? ESOPAY_HOME_ROUTE : MONITORING_HOME_ROUTE;
}
