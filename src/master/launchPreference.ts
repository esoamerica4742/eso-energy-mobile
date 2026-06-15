import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_LAUNCH_PREFERENCE_KEY,
  type DefaultLaunchPreference,
} from '@/master/constants';

function normalize(value: string | null): DefaultLaunchPreference {
  if (value === 'inverter' || value === 'eso_pay') return value;
  return null;
}

export async function getDefaultLaunchPreference(): Promise<DefaultLaunchPreference> {
  const raw = await AsyncStorage.getItem(DEFAULT_LAUNCH_PREFERENCE_KEY);
  return normalize(raw);
}

export async function setDefaultLaunchPreference(
  preference: DefaultLaunchPreference,
): Promise<void> {
  if (!preference) {
    await AsyncStorage.removeItem(DEFAULT_LAUNCH_PREFERENCE_KEY);
    return;
  }
  await AsyncStorage.setItem(DEFAULT_LAUNCH_PREFERENCE_KEY, preference);
}
