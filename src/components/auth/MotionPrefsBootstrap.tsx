import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import { loadMotionPrefs, saveMotionPrefs } from '@/lib/motionPrefsPersistence';
import { useMotionPrefsStore } from '@/stores/motionPrefsStore';

export function persistMotionPrefsFromStore() {
  const state = useMotionPrefsStore.getState();
  void saveMotionPrefs({
    ambientParallaxEnabled: state.ambientParallaxEnabled,
    reducedMotionEnabled: state.reducedMotionEnabled,
    reducedMotionOverridden: state.reducedMotionOverridden,
  });
}

function persistCurrentPrefs() {
  persistMotionPrefsFromStore();
}

export function MotionPrefsBootstrap() {
  const hydrateFromPersisted = useMotionPrefsStore((s) => s.hydrateFromPersisted);
  const setMotionPrefsHydrated = useMotionPrefsStore((s) => s.setMotionPrefsHydrated);
  const setReducedMotionFromSystem = useMotionPrefsStore((s) => s.setReducedMotionFromSystem);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const stored = await loadMotionPrefs();
      if (!mounted) return;

      if (stored) {
        hydrateFromPersisted(stored);
      } else {
        const osReduced = await AccessibilityInfo.isReduceMotionEnabled();
        if (!mounted) return;
        setReducedMotionFromSystem(Boolean(osReduced));
        setMotionPrefsHydrated(true);
        persistCurrentPrefs();
      }
    };

    void boot();

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      const state = useMotionPrefsStore.getState();
      if (state.reducedMotionOverridden) return;
      setReducedMotionFromSystem(Boolean(enabled));
      persistCurrentPrefs();
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [hydrateFromPersisted, setMotionPrefsHydrated, setReducedMotionFromSystem]);

  return null;
}
