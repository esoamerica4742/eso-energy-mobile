import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase';

/** Max wait for Supabase session restore on cold start before unblocking public routes. */
export const SESSION_BOOT_TIMEOUT_MS = 8000;

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      setLoading(false);
    };

    timeout = setTimeout(() => {
      if (__DEV__) {
        console.debug(
          `[auth] Session boot timed out after ${SESSION_BOOT_TIMEOUT_MS}ms — continuing unauthenticated`,
        );
      }
      finish();
    }, SESSION_BOOT_TIMEOUT_MS);

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      finish();
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        finish();
      })
      .catch(() => {
        finish();
      });

    return () => {
      settled = true;
      if (timeout) clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: Boolean(session),
  };
}

export type AuthUser = User;
