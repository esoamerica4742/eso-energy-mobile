/**
 * Eso Pay Supabase client — same project as monitoring, isolated session on device.
 *
 * Default: reuse EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.
 * Optional override (second project): EXPO_PUBLIC_ESOPAY_SUPABASE_*.
 *
 * Auth is stored under the `esopay_auth` prefix so phone OTP (Eso Pay) and
 * email OTP (monitoring) can be signed in independently on one Supabase project.
 */
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseSecureStorage } from '@/lib/secureStorage';

type ExtraConfig = {
  esoPaySupabaseUrl?: string;
  esoPaySupabaseAnonKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

function getExtra(): ExtraConfig {
  const expoExtra = Constants.expoConfig?.extra;
  if (expoExtra && typeof expoExtra === 'object') {
    return expoExtra as ExtraConfig;
  }
  const legacy = (Constants as { manifest?: { extra?: ExtraConfig } }).manifest?.extra;
  return legacy ?? {};
}

const extra = getExtra();

const esoPaySupabaseUrl = (
  extra.esoPaySupabaseUrl ??
  process.env.EXPO_PUBLIC_ESOPAY_SUPABASE_URL ??
  extra.supabaseUrl ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  ''
).trim();

const esoPaySupabaseAnonKey = (
  extra.esoPaySupabaseAnonKey ??
  process.env.EXPO_PUBLIC_ESOPAY_SUPABASE_ANON_KEY ??
  extra.supabaseAnonKey ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  ''
).trim();

export const esoPaySupabaseConfigured = Boolean(esoPaySupabaseUrl && esoPaySupabaseAnonKey);

/**
 * Storage isolation: use a dedicated secure storage namespace.
 * `createSupabaseSecureStorage` supports an optional prefix in this codebase.
 */
export const esoPaySupabase = createClient(esoPaySupabaseUrl, esoPaySupabaseAnonKey || 'invalid', {
  auth: {
    storage: createSupabaseSecureStorage('esopay_auth'),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

