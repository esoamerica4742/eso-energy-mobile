/**
 * Tenant context queries.
 * Fetches company profile + sites for the logged-in user.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/stores/authStore';
import type { DbCompany, DbSite, DbUser } from './types';

function mapProfileRole(role: string | null | undefined): UserRole {
  if (role === 'ORG_ADMIN' || role === 'SUPER_ADMIN') return 'admin';
  if (role === 'SITE_MANAGER') return 'technician';
  return 'viewer';
}

/** Minimal company_id read when full profile select fails. */
export async function fetchProfileCompanyId(
  userId: string,
  client: SupabaseClient = supabase,
): Promise<string | null> {
  const { data, error } = await client
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[tenant] fetchProfileCompanyId:', error.message);
    return null;
  }
  return data?.company_id ?? null;
}

/** Load user's profile row (role + company_id) */
export async function fetchUserProfile(
  userId: string,
  client: SupabaseClient = supabase,
): Promise<DbUser | null> {
  const { data, error } = await client
    .from('profiles')
    .select('id, company_id, role, full_name, email')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[tenant] fetchUserProfile:', error.message);
    return null;
  }

  if (!data?.company_id) {
    console.warn('[tenant] fetchUserProfile: missing profile or company_id for user', userId);
    return null;
  }

  return {
    id: data.id,
    company_id: data.company_id,
    role: mapProfileRole(data.role),
    full_name: data.full_name ?? null,
    avatar_url: null,
  };
}

/** Load the company row */
export async function fetchCompany(companyId: string): Promise<DbCompany | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, created_at')
    .eq('id', companyId)
    .single();

  if (error) {
    console.warn('[tenant] fetchCompany:', error.message);
    return null;
  }
  return data as DbCompany;
}

/** All sites accessible for a company (RLS ensures tenant isolation) */
export async function fetchSites(companyId: string): Promise<DbSite[]> {
  const { data, error } = await supabase
    .from('sites')
    .select('id, company_id, name, location, latitude, longitude, created_at')
    .eq('company_id', companyId)
    .order('name');

  if (error) {
    console.warn('[tenant] fetchSites:', error.message);
    return [];
  }
  return (data ?? []) as DbSite[];
}
