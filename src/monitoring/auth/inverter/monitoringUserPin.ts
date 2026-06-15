import type { User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export function isNewMonitoringUser(user: User): boolean {
  return user.user_metadata?.hasPin !== true;
}

export async function clearMonitoringHasPin(): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseConfigured) {
    return { ok: true };
  }

  const { error } = await supabase.auth.updateUser({
    data: { hasPin: false },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveMonitoringHasPin(): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseConfigured) {
    return { ok: true };
  }

  const { error } = await supabase.auth.updateUser({
    data: { hasPin: true },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
