import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'esopay:biometric-pin:';

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

export async function getBiometricPinEnabled(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    return raw === '1';
  } catch {
    return false;
  }
}

export async function setBiometricPinEnabled(userId: string, enabled: boolean): Promise<void> {
  if (!userId) return;
  await AsyncStorage.setItem(storageKey(userId), enabled ? '1' : '0');
}
