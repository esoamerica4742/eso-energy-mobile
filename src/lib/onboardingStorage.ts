import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ESO Energy onboarding persistence.
 * Intentionally versioned so we can force a new onboarding when the UX changes.
 */
const KEY = 'eso_energy_onboarding_complete_v2026_06_11';

export async function getOnboardingComplete(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === '1';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}
