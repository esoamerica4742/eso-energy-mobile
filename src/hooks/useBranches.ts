import { useSitesFleet } from '@/hooks/useSitesFleet';

/** @deprecated Use useSitesFleet — kept for backward-compatible imports. */
export function useBranches() {
  return useSitesFleet();
}
