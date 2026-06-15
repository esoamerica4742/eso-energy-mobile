import { clearMonitoringQueryCache } from '@/lib/auth/productSessionCleanup';
import { clearMonitoringPinSession } from '@/monitoring/auth/monitoringPinSession';
import { appQueryClient } from '@/lib/queryClient';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { useAlertStore } from '@/stores/alertStore';
import { useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';

/**
 * Clears monitoring session + local state after Eso Pay login.
 * Does not touch Eso Pay auth storage.
 */
export async function detachMonitoringSessionAfterEsoPayLogin(): Promise<void> {
  if (!supabaseConfigured) return;

  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Monitoring store may already be empty.
  }

  clearMonitoringPinSession();
  useAuthStore.getState().reset();
  useSiteStore.getState().setSites([]);
  useAlertStore.getState().reset();
  clearMonitoringQueryCache(appQueryClient);
}
