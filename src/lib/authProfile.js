import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';
import { supabase, supabaseConfigured } from './supabase';

/** Monitoring onboarding complete (company fleet dashboard). */
export function isMonitoringProfileComplete(user) {
  if (!user) return false;
  const meta = user.user_metadata ?? {};
  if (meta.module === 'esopay' && !meta.company?.trim()) return false;
  if (meta.profile_complete === true && meta.module !== 'esopay') return true;
  return Boolean(meta.full_name?.trim() && meta.company?.trim());
}

/** @deprecated Use isMonitoringProfileComplete or isEsoPayProfileComplete */
export function isReturningUser(user) {
  return isMonitoringProfileComplete(user);
}

/** Eso Pay individual profile (no company required). */
export function isEsoPayProfileComplete(user) {
  if (!user) return false;
  const meta = user.user_metadata ?? {};
  if (meta.esopay_profile_complete === true) return true;
  return meta.module === 'esopay' && Boolean(meta.full_name?.trim());
}

export async function saveEsoPayProfile({ name, phone, country }) {
  if (!esoPaySupabaseConfigured) {
    return { ok: true };
  }

  const { data: sessionData, error: sessionError } = await esoPaySupabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    return {
      ok: false,
      error: 'Your sign-in session expired. Go back and enter your email code again.',
    };
  }

  const { data, error } = await esoPaySupabase.auth.updateUser({
    data: {
      full_name: name.trim(),
      phone: phone?.trim() || null,
      country: typeof country === 'string' ? country : country?.name,
      module: 'esopay',
      esopay_profile_complete: true,
      profile_complete: true,
    },
  });

  if (error) {
    const message = error.message?.toLowerCase().includes('auth session missing')
      ? 'Your sign-in session expired. Go back and enter your email code again.'
      : error.message;
    return { ok: false, error: message };
  }

  return { ok: true, user: data.user };
}

export function getDisplayName(user, fallback = 'there') {
  const meta = user?.user_metadata ?? {};
  const name = meta.full_name || meta.name || '';
  const first = name.trim().split(/\s+/)[0];
  return first || fallback;
}

export async function saveUserProfile({ name, company, title, country, module }) {
  if (!supabaseConfigured) {
    return { ok: true };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    return {
      ok: false,
      error: 'Your sign-in session expired. Go back and enter your email code again.',
    };
  }

  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: name.trim(),
      company: company.trim(),
      job_title: title.trim(),
      country: typeof country === 'string' ? country : country?.name,
      module: module || 'inverter',
      profile_complete: true,
    },
  });

  if (error) {
    const message = error.message?.toLowerCase().includes('auth session missing')
      ? 'Your sign-in session expired. Go back and enter your email code again.'
      : error.message;
    return { ok: false, error: message };
  }

  return { ok: true, user: data.user };
}

/**
 * Persist monitoring OTP session on the default Supabase client (not Eso Pay storage).
 */
export async function establishMonitoringSession(session) {
  if (!supabaseConfigured) {
    throw new Error('Monitoring Supabase is not configured');
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (error) throw error;

  const active = data.session ?? session;
  const { data: check } = await supabase.auth.getSession();
  if (!check.session) {
    throw new Error('Monitoring session did not persist on this device');
  }

  return active;
}

export async function getCurrentUser() {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/** Eso Pay auth user (isolated session storage — not the monitoring client). */
export async function getEsoPayCurrentUser() {
  if (!esoPaySupabaseConfigured) return null;
  const { data, error } = await esoPaySupabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
