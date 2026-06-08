import type { ReactNode } from 'react';
import { useEsoPaySessionKeeper } from '@/esopay/auth/useEsoPaySessionKeeper';
import { useEsoPaySessionSync } from '@/esopay/auth/useEsoPaySessionSync';

export function EsoPayAuthProvider({ children }: { children: ReactNode }) {
  useEsoPaySessionSync();
  useEsoPaySessionKeeper();
  return <>{children}</>;
}
