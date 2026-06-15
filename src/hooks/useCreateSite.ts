import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSite, type CreateSiteInput } from '@/services/supabase/tenant';
import { useAuthStore, selectTenantId } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';
import type { Site } from '@/stores/siteStore';

export function useCreateSite() {
  const companyId = useAuthStore(selectTenantId);
  const setSites = useSiteStore((s) => s.setSites);
  const sites = useSiteStore((s) => s.sites);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSiteInput) => {
      if (!companyId) {
        throw new Error('Sign in to add a site');
      }
      return createSite(companyId, input);
    },
    onSuccess: (row) => {
      const next: Site = {
        id: row.id,
        name: row.name,
        company_id: row.company_id,
        location: row.location ?? undefined,
        latitude: row.latitude ?? undefined,
        longitude: row.longitude ?? undefined,
      };
      setSites([...sites, next]);
      void queryClient.invalidateQueries({ queryKey: ['tenant', 'sites', companyId] });
    },
  });
}
