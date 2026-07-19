import { exitDemoModeFully } from '@/lib/demoModeBridge';
import { clearMonitoringQueryCache } from '@/lib/auth/productSessionCleanup';
import { appQueryClient } from '@/lib/queryClient';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { clearEsoPaySession } from '@/esopay/auth/syncEsoPaySession';
import { useMasterSessionStore } from '@/master/masterSessionStore';
import { clearMonitoringPinSession } from '@/monitoring/auth/monitoringPinSession';
import { useAlertStore } from '@/stores/alertStore';
import { useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';

/** Signs out of the unified Eso Energy account on this device. */
export async function signOutUnified(): Promise<void> {
  clearMonitoringPinSession();
  useMasterSessionStore.getState().reset();
  exitDemoModeFully();

  if (supabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Session may already be cleared.
    }
  }

  clearEsoPaySession();
  useAuthStore.getState().reset();
  useSiteStore.getState().setSites([]);
  useAlertStore.getState().reset();
  clearMonitoringQueryCache(appQueryClient);
}
