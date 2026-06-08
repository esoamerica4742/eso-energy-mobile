import { exitDemoModeFully } from '@/lib/demoModeBridge';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';

/**
 * Sign-out for ESO Inverter Monitoring only — does not touch Eso Pay Bills session.
 */
export async function signOutMonitoring(): Promise<void> {
  exitDemoModeFully();

  if (supabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Session may already be cleared.
    }
  }

  useAuthStore.getState().reset();
  useSiteStore.getState().setSites([]);
}
