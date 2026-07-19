import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_MODE_ACTIVE_KEY = 'eso.demoModeActive';

export async function readDemoModePersisted(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DEMO_MODE_ACTIVE_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function persistDemoModeActive(active: boolean): Promise<void> {
  try {
    if (active) {
      await AsyncStorage.setItem(DEMO_MODE_ACTIVE_KEY, '1');
    } else {
      await AsyncStorage.removeItem(DEMO_MODE_ACTIVE_KEY);
    }
  } catch {
    // Best-effort — demo still works for the current session.
  }
}
