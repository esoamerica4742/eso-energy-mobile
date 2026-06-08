import { useSupabaseSession } from '@/hooks/useSupabaseSession';

/** Signed-in user access state. */
export function useAppAccess() {
  const { session, user, loading, isAuthenticated } = useSupabaseSession();

  return {
    session,
    user,
    loading,
    isAuthenticated,
    isDemoMode: false,
  };
}
