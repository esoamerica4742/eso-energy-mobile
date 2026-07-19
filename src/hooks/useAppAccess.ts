import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useDemoModeActive } from '@/providers/DemoModeProvider';

/** Signed-in user access state. */
export function useAppAccess() {
  const { session, user, loading, isAuthenticated } = useSupabaseSession();
  const isDemoMode = useDemoModeActive();

  return {
    session,
    user,
    loading,
    isAuthenticated,
    isDemoMode,
  };
}
