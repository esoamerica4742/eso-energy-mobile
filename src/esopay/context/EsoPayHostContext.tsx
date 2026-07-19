import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { InteractionManager } from 'react-native';
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
import { useAuthStore } from '@/stores/authStore';

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
  // Prevent multiple back-to-back clears from concurrent 401s.
  const sessionExpiredHandled = useRef(false);

  useEffect(() => {
    // Heal Pay store when entering from Monitoring (unified account).
    if (!isDemoMode && (!esoPaySignedIn || !esoPaySession?.access_token)) {
      void recoverEsoPaySession();
    }
    if (esoPaySignedIn && esoPaySession?.access_token) {
      sessionExpiredHandled.current = false;
    }
  }, [esoPaySignedIn, esoPaySession?.access_token, isDemoMode]);

  const refreshAuthToken = useCallback(async () => refreshEsoPayAccessToken(), []);

  const ensureAuthSession = useCallback(async () => {
    return ensureEsoPayApiSession();
  }, []);

  /**
   * Called from Axios after a failed 401 refresh.
   * Recover from the unified / Monitoring session — never wipe Pay on switch races.
   */
  const onSessionExpired = useCallback(() => {
    if (isDemoMode) return;
    if (sessionExpiredHandled.current) return;
    sessionExpiredHandled.current = true;
    InteractionManager.runAfterInteractions(() => {
      void (async () => {
        try {
          const recovered = await recoverEsoPaySession();
          if (recovered?.access_token) return;

          const monitoringSession = useAuthStore.getState().session;
          if (monitoringSession?.access_token) {
            const store = useEsoPayAuthStore.getState();
            store.lockSignedIn();
            store.setSession(monitoringSession);
          }
        } finally {
          sessionExpiredHandled.current = false;
        }
      })();
    });
  }, [isDemoMode]);

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
