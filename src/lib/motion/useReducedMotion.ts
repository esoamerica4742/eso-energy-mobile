import { useMotionPrefsStore } from '@/stores/motionPrefsStore';

export function useReducedMotion() {
  return useMotionPrefsStore((s) => s.reducedMotionEnabled);
}

export function useMotionEnabled() {
  const reduced = useReducedMotion();
  return !reduced;
}
