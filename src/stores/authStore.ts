/**
 * Auth + tenant context store.
 * Single source of truth for who is logged in and which company/site they own.
 */
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'technician' | 'viewer';

export interface TenantProfile {
  company_id: string;
  company_name: string;
  role: UserRole;
  /** Sites the user can access */
  site_ids: string[];
}

interface AuthState {
  session: Session | null;
  user: User | null;
  tenant: TenantProfile | null;
  loading: boolean;

  setSession: (session: Session | null) => void;
  setTenant: (tenant: TenantProfile | null) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  tenant: null,
  loading: true,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setTenant: (tenant) => set({ tenant }),

  setLoading: (loading) => set({ loading }),

  reset: () => set({ session: null, user: null, tenant: null, loading: false }),
}));

/** Convenience selectors */
export const selectTenantId   = (s: AuthState) => s.tenant?.company_id ?? null;
export const selectRole       = (s: AuthState) => s.tenant?.role ?? 'viewer';
export const selectIsAdmin    = (s: AuthState) => s.tenant?.role === 'admin';
export const selectIsLoggedIn = (s: AuthState) => s.session !== null;
