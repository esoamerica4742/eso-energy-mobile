import { useCallback, useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  getBiometricUnlockEnabled,
  setBiometricUnlockEnabled,
} from '@/master/storage/biometricUnlockPreference';

export function useMasterBiometricUnlock(userId: string | undefined) {
  const [hardwareAvailable, setHardwareAvailable] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('Biometrics');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      const types = hasHardware ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];
      const biometricLabel = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
        ? 'Face ID'
        : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
          ? 'Fingerprint'
          : 'Biometrics';

      setHardwareAvailable(hasHardware);
      setEnrolled(isEnrolled);
      setLabel(biometricLabel);
      setEnabled(userId ? await getBiometricUnlockEnabled(userId) : false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setPreference = useCallback(
    async (next: boolean) => {
      if (!userId) return false;
      await setBiometricUnlockEnabled(userId, next);
      setEnabled(next);
      return true;
    },
    [userId],
  );

  const authenticate = useCallback(async () => {
    if (!enabled || !hardwareAvailable || !enrolled) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Eso Energy',
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
    });
    return result.success;
  }, [enabled, enrolled, hardwareAvailable]);

  return {
    hardwareAvailable,
    enrolled,
    available: hardwareAvailable && enrolled,
    enabled,
    label,
    loading,
    setPreference,
    authenticate,
    refresh,
  };
}
