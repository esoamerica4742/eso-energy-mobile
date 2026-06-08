import { selectEsoPayHasAccess, useEsoPayAuthStore } from '@/esopay/auth/store';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';

/** True when Eso Pay API calls can run (signed in + user id). JWT is restored per request if needed. */
export function useEsoPayEnabled(enabled = true): boolean {
  const host = useEsoPayHost();
  const signedIn = useEsoPayAuthStore(selectEsoPayHasAccess);
  return enabled && signedIn && Boolean(host.companyId);
}
