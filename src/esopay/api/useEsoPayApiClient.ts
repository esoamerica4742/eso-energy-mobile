import { useEffect } from 'react';
import { bindEsoPayApiCredentials, esoPayApi, esopayApiClient } from '@/esopay/api/client';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';

export type EsoPayApiClient = typeof esoPayApi;

/**
 * Returns the typed Monnify-backed Eso Pay API with credentials synced from host context.
 * Must be called under EsoPayHostContextProvider.
 */
export function useEsoPayApiClient(): EsoPayApiClient {
  const host = useEsoPayHost();

  useEffect(() => {
    bindEsoPayApiCredentials({
      authToken: host.authToken,
      companyId: host.companyId,
      refreshAuthToken: host.refreshAuthToken,
      ensureAuthSession: host.ensureAuthSession,
      onSessionExpired: host.onSessionExpired,
    });
  }, [
    host.authToken,
    host.companyId,
    host.ensureAuthSession,
    host.refreshAuthToken,
    host.onSessionExpired,
  ]);

  return esoPayApi;
}

/** Raw Axios instance when you need custom paths outside `esoPayApi`. */
export function useEsoPayHttpClient() {
  const host = useEsoPayHost();

  useEffect(() => {
    bindEsoPayApiCredentials({
      authToken: host.authToken,
      companyId: host.companyId,
      refreshAuthToken: host.refreshAuthToken,
      ensureAuthSession: host.ensureAuthSession,
      onSessionExpired: host.onSessionExpired,
    });
  }, [
    host.authToken,
    host.companyId,
    host.ensureAuthSession,
    host.refreshAuthToken,
    host.onSessionExpired,
  ]);

  return esopayApiClient;
}
