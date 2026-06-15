import { useCallback } from 'react';
import {
  selectPinSessionUnlocked,
  useEsoPayAuthStore,
} from '@/esopay/auth/store';

/** Transaction PIN session — unlock after verify; lock on background / sign-out. */
export function useEsoPayPinSession() {
  const unlocked = useEsoPayAuthStore(selectPinSessionUnlocked);
  const setUnlocked = useEsoPayAuthStore((s) => s.setPinSessionUnlocked);

  const unlock = useCallback(() => setUnlocked(true), [setUnlocked]);
  const lock = useCallback(() => setUnlocked(false), [setUnlocked]);

  return { unlocked, unlock, lock, setUnlocked };
}
