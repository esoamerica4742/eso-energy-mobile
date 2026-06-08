import { useEffect, useState } from 'react';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { getPersistedEsoPayUserId, persistEsoPayUserId } from '@/esopay/auth/esoPayUserId';

/** Stable Eso Pay user id for PIN + wallet — survives brief session nulls. */
export function useEsoPayUserId() {
  const signedIn = useEsoPayAuthStore((s) => s.signedIn);
  const sessionUserId = useEsoPayAuthStore((s) => s.user?.id);
  const [cachedId, setCachedId] = useState('');
  const [cacheLoaded, setCacheLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getPersistedEsoPayUserId().then((id) => {
      if (cancelled) return;
      if (id) setCachedId(id);
      setCacheLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionUserId) return;
    setCachedId(sessionUserId);
    void persistEsoPayUserId(sessionUserId);
  }, [sessionUserId]);

  const userId = sessionUserId ?? cachedId;
  const ready = cacheLoaded && (!signedIn || Boolean(userId));

  return { userId, ready };
}
