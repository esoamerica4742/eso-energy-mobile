import { useCallback, useEffect, useRef, useState } from 'react';
import { EsoPayApiError, toEsoPayApiError } from '@/esopay/api/client';
import { parseEsoPayReservedAccount } from '@/esopay/api/schemas';
import type { EsoPayReservedAccount } from '@/esopay/api/types';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { ensureEsoPayApiSession } from '@/esopay/auth/ensureEsoPayApiSession';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';

const PROVISION_TIMEOUT_MS = 40_000;

async function checkMonnifyHealth(api: ReturnType<typeof useEsoPayApiClient>): Promise<void> {
  try {
    const health = await api.health.monnify();
    if (!health.ok) {
      throw new EsoPayApiError(
        health.message ??
          'Monnify is not configured on Supabase. Add MONNIFY_* secrets and redeploy eso-pay-api.',
        503,
        health.code ?? 'MONNIFY_NOT_CONFIGURED',
      );
    }
  } catch (error) {
    const apiError = toEsoPayApiError(error);
    if (apiError.code === 'MONNIFY_NOT_CONFIGURED' || apiError.code === 'MONNIFY_AUTH_FAILED') {
      throw apiError;
    }
    // Older deployed BFF without /health/monnify — continue to reserved-account flow.
    if (apiError.status !== 404) {
      throw apiError;
    }
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(
          new EsoPayApiError(
            'Bank account setup timed out. Confirm Monnify secrets are set on Supabase, then tap Try again.',
            408,
            'PROVISION_TIMEOUT',
          ),
        );
      }, ms);
    }),
  ]);
}

async function fetchReservedAccount(
  api: ReturnType<typeof useEsoPayApiClient>,
): Promise<EsoPayReservedAccount> {
  try {
    return parseEsoPayReservedAccount(await api.wallet.getReservedAccount());
  } catch (error) {
    const apiError = toEsoPayApiError(error);
    if (apiError.code === 'MONNIFY_NOT_CONFIGURED') {
      throw error;
    }
    if (
      apiError.status === 404 ||
      apiError.code === 'NOT_FOUND' ||
      apiError.code === 'RESERVED_ACCOUNT_UNAVAILABLE'
    ) {
      return parseEsoPayReservedAccount(await api.wallet.ensureReservedAccount());
    }
    throw error;
  }
}

/** Fund screen — provisions Monnify virtual account once, with timeout (no infinite spinner). */
export function useFundWalletProvision() {
  const api = useEsoPayApiClient();
  const host = useEsoPayHost();
  const signedIn = useEsoPayAuthStore(selectEsoPayHasAccess);
  const authHydrated = useEsoPayAuthStore((s) => s.hydrated);
  const authLoading = useEsoPayAuthStore((s) => s.loading);
  const [reserved, setReserved] = useState<EsoPayReservedAccount | null>(null);
  const [error, setError] = useState<EsoPayApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const runId = useRef(0);

  const authReady =
    signedIn && authHydrated && !authLoading && host.isReady && Boolean(host.userId || host.companyId);

  const provision = useCallback(async () => {
    const id = ++runId.current;
    setLoading(true);
    setError(null);

    try {
      await recoverEsoPaySession();
      await ensureEsoPayApiSession();
      await checkMonnifyHealth(api);
      const account = await withTimeout(fetchReservedAccount(api), PROVISION_TIMEOUT_MS);
      if (runId.current !== id) return;
      setReserved(account);
    } catch (err) {
      if (runId.current !== id) return;
      setReserved(null);
      setError(toEsoPayApiError(err));
    } finally {
      if (runId.current === id) setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!authReady) return;
    void provision();
  }, [authReady, provision]);

  return {
    reserved,
    error,
    loading: signedIn && (loading || !authReady),
    signedIn,
    retry: provision,
  };
}
