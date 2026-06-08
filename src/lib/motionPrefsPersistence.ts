import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PersistedMotionPrefs {
  ambientParallaxEnabled: boolean;
  reducedMotionEnabled: boolean;
  reducedMotionOverridden: boolean;
}

const MOTION_PREFS_KEY = '@eso_energy:motion_prefs:v1';

export async function loadMotionPrefs(): Promise<PersistedMotionPrefs | null> {
  try {
    const raw = await AsyncStorage.getItem(MOTION_PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedMotionPrefs>;

    if (
      typeof parsed.ambientParallaxEnabled !== 'boolean' ||
      typeof parsed.reducedMotionEnabled !== 'boolean' ||
      typeof parsed.reducedMotionOverridden !== 'boolean'
    ) {
      return null;
    }

    return {
      ambientParallaxEnabled: parsed.ambientParallaxEnabled,
      reducedMotionEnabled: parsed.reducedMotionEnabled,
      reducedMotionOverridden: parsed.reducedMotionOverridden,
    };
  } catch {
    return null;
  }
}

export async function saveMotionPrefs(prefs: PersistedMotionPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(MOTION_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore persistence failures; runtime UX should still work.
  }
}
