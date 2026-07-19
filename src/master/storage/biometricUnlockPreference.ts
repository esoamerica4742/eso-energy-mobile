import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'master:biometric-unlock:';

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

export async function getBiometricUnlockEnabled(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    return (await AsyncStorage.getItem(storageKey(userId))) === '1';
  } catch {
    return false;
  }
}

export async function setBiometricUnlockEnabled(userId: string, enabled: boolean): Promise<void> {
  if (!userId) return;
  await AsyncStorage.setItem(storageKey(userId), enabled ? '1' : '0');
}
