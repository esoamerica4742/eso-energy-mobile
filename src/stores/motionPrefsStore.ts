import { create } from 'zustand';
import type { PersistedMotionPrefs } from '@/lib/motionPrefsPersistence';

interface MotionPrefsState {
  ambientParallaxEnabled: boolean;
  reducedMotionEnabled: boolean;
  reducedMotionOverridden: boolean;
  motionPrefsHydrated: boolean;
  hydrateFromPersisted: (prefs: PersistedMotionPrefs) => void;
  setMotionPrefsHydrated: (hydrated: boolean) => void;
  setAmbientParallaxEnabled: (enabled: boolean) => void;
  setReducedMotionFromSystem: (enabled: boolean) => void;
  setReducedMotionEnabled: (enabled: boolean) => void;
}

export const useMotionPrefsStore = create<MotionPrefsState>((set) => ({
  ambientParallaxEnabled: true,
  reducedMotionEnabled: false,
  reducedMotionOverridden: false,
  motionPrefsHydrated: false,
  hydrateFromPersisted: (prefs) =>
    set({
      ambientParallaxEnabled: prefs.ambientParallaxEnabled,
      reducedMotionEnabled: prefs.reducedMotionEnabled,
      reducedMotionOverridden: prefs.reducedMotionOverridden,
      motionPrefsHydrated: true,
    }),
  setMotionPrefsHydrated: (motionPrefsHydrated) => set({ motionPrefsHydrated }),
  setAmbientParallaxEnabled: (enabled) => set({ ambientParallaxEnabled: enabled }),
  setReducedMotionFromSystem: (enabled) =>
    set((s) =>
      s.reducedMotionOverridden
        ? {}
        : {
            reducedMotionEnabled: enabled,
          },
    ),
  setReducedMotionEnabled: (enabled) =>
    set({
      reducedMotionEnabled: enabled,
      reducedMotionOverridden: true,
    }),
}));
