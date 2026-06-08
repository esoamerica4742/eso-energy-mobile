import { useCallback, useEffect, useState } from 'react';
import {
  hasOperatorPin,
  setOperatorPin,
  verifyOperatorPin,
} from '@/lib/monitoring/operatorPin';
import { useAuthStore } from '@/stores/authStore';

export function useOperatorPin() {
  const userId = useAuthStore((s) => s.user?.id);
  const [pinConfigured, setPinConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPinConfigured(false);
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    const exists = await hasOperatorPin(userId);
    setPinConfigured(exists);
    setIsChecking(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const configurePin = useCallback(
    async (pin: string) => {
      if (!userId) throw new Error('Sign in to configure your operator PIN');
      await setOperatorPin(userId, pin);
      setPinConfigured(true);
    },
    [userId],
  );

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!userId) return false;
      return verifyOperatorPin(userId, pin);
    },
    [userId],
  );

  return {
    pinConfigured,
    isChecking,
    refresh,
    configurePin,
    verifyPin,
  };
}
