import { useCallback } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { goEsoPayBack } from '@/esopay/navigation/esoPayBack';

export function useEsoPayBack() {
  const router = useRouter();
  const segments = useSegments();

  return useCallback(() => {
    goEsoPayBack(router, segments);
  }, [router, segments]);
}
