import { useCallback, useEffect, useState } from 'react';
import { useEsoPayUserId } from '@/esopay/hooks/useEsoPayUserId';
import { clearLoginPin, hasLoginPin, setLoginPin, verifyLoginPin } from '@/esopay/storage/loginPin';

export function useLoginPin() {
  const { userId, ready } = useEsoPayUserId();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!ready || !userId) {
      setPinConfigured(false);
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    void hasLoginPin(userId).then((exists) => {
      if (cancelled) return;
      setPinConfigured(exists);
      setIsChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  const configurePin = useCallback(
    async (pin: string) => {
      if (!userId) throw new Error('Sign in to set your login PIN');
      await setLoginPin(userId, pin);
      setPinConfigured(await hasLoginPin(userId));
    },
    [userId],
  );

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!userId) return false;
      return verifyLoginPin(userId, pin);
    },
    [userId],
  );

  const clearPin = useCallback(async () => {
    if (!userId) return;
    await clearLoginPin(userId);
    setPinConfigured(false);
  }, [userId]);

  return { pinConfigured, isChecking, configurePin, verifyPin, clearPin, userIdReady: ready && Boolean(userId) };
}

