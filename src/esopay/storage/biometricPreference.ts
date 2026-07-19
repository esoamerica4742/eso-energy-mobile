import {
  getBiometricUnlockEnabled,
  setBiometricUnlockEnabled,
} from '@/master/storage/biometricUnlockPreference';

/** @deprecated Alias — master biometric preference covers unlock and payments. */
export async function getBiometricPinEnabled(userId: string): Promise<boolean> {
  return getBiometricUnlockEnabled(userId);
}

/** @deprecated Alias — master biometric preference covers unlock and payments. */
export async function setBiometricPinEnabled(userId: string, enabled: boolean): Promise<void> {
  return setBiometricUnlockEnabled(userId, enabled);
}
