import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { appQueryClient } from '@/lib/queryClient';
import { clearDemoCache, clearDemoSession, seedDemoSession } from '@/lib/demoFleet';
import { persistDemoModeActive, readDemoModePersisted } from '@/lib/demoModePersistence';
import {
  registerAuthRehydrate,
  registerDemoExitForAuth,
  registerDemoExitFully,
} from '@/lib/demoModeBridge';

type DemoModeContextValue = {
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
};

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

/** Sync flag so auth/navigation see demo mode before the next React render. */
let demoModeActiveSync = false;

export function isDemoModeActiveSync(): boolean {
  return demoModeActiveSync;
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const enterDemoMode = useCallback(() => {
    demoModeActiveSync = true;
    setIsDemoMode(true);
    seedDemoSession(appQueryClient);
    void persistDemoModeActive(true);
  }, []);

  const exitDemoForAuth = useCallback(() => {
    if (!demoModeActiveSync && !isDemoMode) return;
    demoModeActiveSync = false;
    setIsDemoMode(false);
    clearDemoCache(appQueryClient);
    void persistDemoModeActive(false);
  }, [isDemoMode]);

  const exitDemoMode = useCallback(() => {
    demoModeActiveSync = false;
    setIsDemoMode(false);
    clearDemoSession(appQueryClient);
    void persistDemoModeActive(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void readDemoModePersisted().then((active) => {
      if (cancelled || !active || demoModeActiveSync) return;
      demoModeActiveSync = true;
      setIsDemoMode(true);
      seedDemoSession(appQueryClient);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    registerDemoExitForAuth(exitDemoForAuth);
    registerDemoExitFully(exitDemoMode);
    return () => {
      registerDemoExitForAuth(null);
      registerDemoExitFully(null);
    };
  }, [exitDemoForAuth, exitDemoMode]);

  const value = useMemo(
    () => ({ isDemoMode, enterDemoMode, exitDemoMode }),
    [isDemoMode, enterDemoMode, exitDemoMode],
  );

  return (
    <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return ctx;
}

/** True when the app should use demo data and allow dashboard without Supabase auth. */
export function useDemoModeActive(): boolean {
  const ctx = useContext(DemoModeContext);
  return demoModeActiveSync || (ctx?.isDemoMode ?? false);
}

