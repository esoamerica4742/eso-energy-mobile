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
import { mapParentRoleToEsoPay } from '@/esopay/context/roles';
import type { EsoPayHostContextValue } from '@/esopay/context/types';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { exitDemoModeFully } from '@/lib/demoModeBridge';
import { DEMO_COMPANY_ID, getDemoDevices } from '@/lib/demoFleet';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { selectRole, useAuthStore } from '@/stores/authStore';

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
 * Bridges parent-app Supabase session into the Eso Pay host contract.
 * Wallet scope is the signed-in user — not a company tenant.
 */
export function EsoPayHostBridge({ children }: { children: ReactNode }) {
  const isDemoMode = useDemoModeActive();
  const esoPaySession = useEsoPayAuthStore((s) => s.session);
  const esoPaySignedIn = useEsoPayAuthStore((s) => s.signedIn);
  const { userId: persistedUserId } = useEsoPayUserId();
  const monitoringSession = useAuthStore((s) => s.session);
  const billingSession = esoPaySession;
  const tenantRole = useAuthStore(selectRole);

  useEffect(() => {
    if (esoPaySignedIn && !esoPaySession?.access_token) {
      void recoverEsoPaySession();
    }
  }, [esoPaySignedIn, esoPaySession?.access_token]);

  const devicesQuery = useEnodeDevices({
    syncOnMount: false,
    enabled: Boolean(monitoringSession),
  });

  const refreshAuthToken = useCallback(async () => refreshEsoPayAccessToken(), []);

  const ensureAuthSession = useCallback(async () => {
    return ensureEsoPayApiSession();
  }, []);

  /** Wallet API errors must not sign the user out — use signOutEsoPay() explicitly. */
  const onSessionExpired = useCallback(() => {}, []);

  const authToken = billingSession?.access_token ?? '';
  const userId = billingSession?.user?.id ?? persistedUserId ?? '';

  const walletScopeId = isDemoMode ? DEMO_COMPANY_ID : userId;
  const resolvedRole = isDemoMode ? 'owner' : mapParentRoleToEsoPay(tenantRole);

  const activeInverterIds = useMemo(() => {
    if (isDemoMode) {
      return getDemoDevices().map((device) => device.id);
    }
    const devices = devicesQuery.data ?? [];
    return devices.map((device) => device.id);
  }, [devicesQuery.data, isDemoMode]);

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
      esoPaySession,
    ],
  );

  return (
    <EsoPayHostContextProvider value={hostValue}>{children}</EsoPayHostContextProvider>
  );
}
