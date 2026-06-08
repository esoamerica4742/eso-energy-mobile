import { useQuery } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';

export const COMPANY_ID_KEY = ['profile', 'company_id'] as const;

export function useCompanyId() {
  const { isAuthenticated } = useSupabaseSession();

  return useQuery({
    queryKey: COMPANY_ID_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_id')
        .maybeSingle();
      if (error) throw error;
      return data?.company_id ?? null;
    },
    enabled: supabaseConfigured && isAuthenticated,
    staleTime: 5 * 60_000,
  });
}
