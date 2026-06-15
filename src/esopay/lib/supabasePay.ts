/**
 * Eso Pay uses the same Supabase project and session as Monitoring.
 * One master account unlocks both command centers.
 */
export {
  supabase as esoPaySupabase,
  supabaseConfigured as esoPaySupabaseConfigured,
  supabaseUrl as esoPaySupabaseUrl,
  supabaseAnonKey as esoPaySupabaseAnonKey,
} from '@/lib/supabase';
