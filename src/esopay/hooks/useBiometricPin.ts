import { useCallback, useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  getBiometricPinEnabled,
  setBiometricPinEnabled,
} from '@/esopay/storage/biometricPreference';
import { useEsoPayUserId } from '@/esopay/hooks/useEsoPayUserId';

export function useBiometricPin() {
  const { userId, ready: userIdReady } = useEsoPayUserId();
  const [hardwareAvailable, setHardwareAvailable] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('Biometrics');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userIdReady) return;
    setLoading(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      const types = hasHardware ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];
      const biometricLabel = types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
        ? 'Face ID'
        : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
          ? 'Fingerprint'
          : 'Biometrics';

      setHardwareAvailable(hasHardware);
      setEnrolled(isEnrolled);
      setLabel(biometricLabel);

      if (userId) {
        setEnabled(await getBiometricPinEnabled(userId));
      } else {
        setEnabled(false);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, userIdReady]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setPreference = useCallback(
    async (next: boolean) => {
      if (!userId) return false;
      await setBiometricPinEnabled(userId, next);
      setEnabled(next);
      return true;
    },
    [userId],
  );

  const authenticate = useCallback(
    async (reason = 'Confirm your identity to authorize payment') => {
      if (!enabled || !hardwareAvailable || !enrolled) return false;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Use PIN',
        disableDeviceFallback: true,
      });
      return result.success;
    },
    [enabled, enrolled, hardwareAvailable],
  );

  return {
    userId,
    userIdReady,
    hardwareAvailable,
    enrolled,
    available: hardwareAvailable && enrolled,
    enabled,
    label,
    loading: loading || !userIdReady,
    refresh,
    setPreference,
    authenticate,
  };
}
