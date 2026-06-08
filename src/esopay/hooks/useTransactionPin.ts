import { useCallback, useEffect, useState } from 'react';
import {
  hasTransactionPin,
  setTransactionPin,
  verifyTransactionPin,
} from '@/esopay/storage/transactionPin';
import { useEsoPayUserId } from '@/esopay/hooks/useEsoPayUserId';

export function useTransactionPin() {
  const { userId, ready: userIdReady } = useEsoPayUserId();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const refresh = useCallback(async () => {
    if (!userIdReady) return;
    if (!userId) {
      setPinConfigured(false);
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    const exists = await hasTransactionPin(userId);
    setPinConfigured(exists);
    setIsChecking(false);
  }, [userId, userIdReady]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const configurePin = useCallback(
    async (pin: string) => {
      if (!userId) {
        throw new Error('Sign in to Eso Pay before setting a transaction PIN');
      }
      await setTransactionPin(userId, pin);
      const saved = await hasTransactionPin(userId);
      if (!saved) {
        throw new Error('PIN could not be saved on this device');
      }
      setPinConfigured(true);
    },
    [userId],
  );

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!userId) return false;
      return verifyTransactionPin(userId, pin);
    },
    [userId],
  );

  return {
    userId,
    userIdReady,
    pinConfigured,
    isChecking: isChecking || !userIdReady,
    refresh,
    configurePin,
    verifyPin,
  };
}
