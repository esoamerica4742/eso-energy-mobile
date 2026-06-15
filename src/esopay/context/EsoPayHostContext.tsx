import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { bindEsoPayApiCredentials } from '@/esopay/api/client';
import {
  ensureEsoPayApiSession,
  refreshEsoPayAccessToken,
} from '@/esopay/auth/ensureEsoPayApiSession';
import { recoverEsoPaySession } from '@/esopay/auth/recoverEsoPaySession';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { useEsoPayUserId } from '@/esopay/hooks/useEsoPayUserId';
import { resolveEsoPayUserRole } from '@/esopay/context/roles';
import type { EsoPayHostContextValue } from '@/esopay/context/types';
import { DEMO_COMPANY_ID, getDemoDevices } from '@/lib/demoFleet';
import { useDemoModeActive } from '@/providers/DemoModeProvider';

const EsoPayHostContext = createContext<EsoPayHostContextValue | null>(null);

export function EsoPayHostContextProvider({
  value,
  children,
}: {
  value: EsoPayHostContextValue;
  children: ReactNode;
}) {
  return (
    <EsoPayHostContext.Provider value={value}>
      <EsoPayApiSessionBinder />
      {children}
    </EsoPayHostContext.Provider>
  );
}

/** Keeps Axios interceptors aligned with the latest host session (memory-only). */
function EsoPayApiSessionBinder() {
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

  return null;
}

export function useEsoPayHost(): EsoPayHostContextValue {
  const ctx = useContext(EsoPayHostContext);
  if (!ctx) {
    throw new Error('useEsoPayHost must be used within EsoPayHostContextProvider');
  }
  return ctx;
}

/**
 * Eso Pay host contract — wallet scoped to the signed-in Eso Pay user only.
 * Does not read monitoring auth, tenant, or Enode device state.
 */
export function EsoPayHostBridge({ children }: { children: ReactNode }) {
  const isDemoMode = useDemoModeActive();
  const esoPaySession = useEsoPayAuthStore((s) => s.session);
  const esoPaySignedIn = useEsoPayAuthStore((s) => s.signedIn);
  const { userId: persistedUserId } = useEsoPayUserId();

  useEffect(() => {
    if (esoPaySignedIn && !esoPaySession?.access_token) {
      void recoverEsoPaySession();
    }
  }, [esoPaySignedIn, esoPaySession?.access_token]);

  const refreshAuthToken = useCallback(async () => refreshEsoPayAccessToken(), []);

  const ensureAuthSession = useCallback(async () => {
    return ensureEsoPayApiSession();
  }, []);

  /** Wallet API errors must not sign the user out — use signOutEsoPay() explicitly. */
  const onSessionExpired = useCallback(() => {}, []);

  const authToken = esoPaySession?.access_token ?? '';
  const userId = esoPaySession?.user?.id ?? persistedUserId ?? '';

  const walletScopeId = isDemoMode ? DEMO_COMPANY_ID : userId;
  const resolvedRole = resolveEsoPayUserRole({ esoPaySignedIn: isDemoMode || esoPaySignedIn });

  const activeInverterIds = useMemo(() => {
    if (!isDemoMode) return [];
    return getDemoDevices().map((device) => device.id);
  }, [isDemoMode]);

  const isReady = isDemoMode
    ? Boolean(walletScopeId)
    : Boolean(esoPaySignedIn && userId);

  const hostValue = useMemo<EsoPayHostContextValue>(
    () => ({
      authToken,
      refreshAuthToken,
      ensureAuthSession,
      companyId: walletScopeId,
      userId,
      userRole: resolvedRole,
      activeInverterIds,
      onSessionExpired,
      isReady,
      companyLinkMissing: false,
      profileLoading: false,
    }),
    [
      activeInverterIds,
      authToken,
      ensureAuthSession,
      isReady,
      onSessionExpired,
      refreshAuthToken,
      resolvedRole,
      userId,
      walletScopeId,
    ],
  );

  return (
    <EsoPayHostContextProvider value={hostValue}>{children}</EsoPayHostContextProvider>
  );
}
