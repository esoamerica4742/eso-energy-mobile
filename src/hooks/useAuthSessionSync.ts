import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { SESSION_BOOT_TIMEOUT_MS } from '@/hooks/useSupabaseSession';
import { exitDemoModeForRealAuth, registerAuthRehydrate } from '@/lib/demoModeBridge';
import { isDemoModeActiveSync } from '@/providers/DemoModeProvider';
import { useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';

export function useAuthSessionSync() {
  const setSession = useAuthStore((s) => s.setSession);
  const reset = useAuthStore((s) => s.reset);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setSites = useSiteStore((s) => s.setSites);

  useEffect(() => {
    if (!supabaseConfigured) {
      reset();
      setLoading(false);
      return;
    }

    let mounted = true;
    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const finishBoot = () => {
      if (!mounted || settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      setLoading(false);
    };

    const applySession = (session: Session | null, bootstrapTenant: boolean) => {
      if (!mounted) return;
      if (isDemoModeActiveSync() && session) {
        exitDemoModeForRealAuth();
      }
      if (isDemoModeActiveSync()) return;

      if (!session) {
        reset();
        setSites([]);
        finishBoot();
        return;
      }

      setSession(session);
      if (bootstrapTenant) {
        setLoading(true);
      } else {
        finishBoot();
      }
    };

    timeout = setTimeout(() => {
      if (!mounted || settled) return;
      if (__DEV__) {
        console.debug('[auth] Auth store boot timed out — releasing loading gate');
      }
      finishBoot();
    }, SESSION_BOOT_TIMEOUT_MS);

    const rehydrate = () => {
      void supabase.auth.getSession().then(({ data }) => {
        applySession(data.session, Boolean(data.session));
      });
    };

    registerAuthRehydrate(rehydrate);

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        applySession(null, false);
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        exitDemoModeForRealAuth();
      }

      const bootstrapTenant =
        event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED';

      applySession(session, bootstrapTenant);
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        applySession(data.session, Boolean(data.session));
      })
      .catch(() => {
        finishBoot();
      });

    return () => {
      mounted = false;
      settled = true;
      if (timeout) clearTimeout(timeout);
      registerAuthRehydrate(null);
      sub.subscription.unsubscribe();
    };
  }, [reset, setLoading, setSession, setSites]);
}
