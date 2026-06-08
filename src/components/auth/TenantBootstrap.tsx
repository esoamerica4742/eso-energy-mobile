/**
 * Loads tenant context (company + sites) after Supabase sign-in.
 * Renders nothing — only runs hooks.
 */
import { useAuthSessionSync } from '@/hooks/useAuthSessionSync';
import { useTenantContext } from '@/hooks/useTenantContext';

export function TenantBootstrap() {
  useAuthSessionSync();
  useTenantContext();
  return null;
}