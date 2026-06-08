/**
 * Supabase client — reads JWT anon key from expo.extra (physical device) or EXPO_PUBLIC_* env.
 */
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseSecureStorage } from '@/lib/secureStorage';

type ExtraConfig = {
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

const url = (
  extra.supabaseUrl ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  ''
).trim();

const anon = (
  extra.supabaseAnonKey ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  ''
).trim();

const publishable = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

function pickClientKey(): string {
  if (anon.startsWith('eyJ')) return anon;
  if (publishable.startsWith('eyJ')) return publishable;
  return anon || publishable;
}

const key = pickClientKey();

export const supabaseUsesPublishableKey =
  Boolean(key) && key.startsWith('sb_publishable_');

export const supabaseKeyHelp =
  'Invalid API key: use the JWT anon key (eyJ...) in eso-energy-mobile/.env as EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart with: npx expo start -c';

export const supabaseConfigured =
  Boolean(url && key) && !supabaseUsesPublishableKey;

/** Resolved URL/key (expo.extra on device, then EXPO_PUBLIC_*). */
export const supabaseUrl = url;
export const supabaseAnonKey = key;

export const supabase = createClient(url, key || 'invalid', {
  auth: {
    storage: createSupabaseSecureStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
