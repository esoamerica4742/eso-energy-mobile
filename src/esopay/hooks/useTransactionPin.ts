import { useCallback, useEffect, useState } from 'react';
import {
  hasTransactionPin,
  setTransactionPin,
  verifyTransactionPin,
} from '@/esopay/storage/transactionPin';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { useEsoPayUserId } from '@/esopay/hooks/useEsoPayUserId';
import { toEsoPayApiError } from '@/esopay/api/client';
import { useEsoPayAuthStore } from '@/esopay/auth/store';

export type VerifyPinResult = {
  ok: boolean;
  attemptsRemaining: number | null;
  locked: boolean;
};

function unlockPinSession() {
  useEsoPayAuthStore.getState().setPinSessionUnlocked(true);
}

/**
 * Eso Pay payment PIN = master app PIN (same secure storage).
 * When the server has no transaction PIN yet, the device master PIN is accepted
 * and synced so purchases can authorize with one PIN.
 */
export function useTransactionPin() {
  const api = useEsoPayApiClient();
  const apiEnabled = useEsoPayEnabled();
  const { userId, ready: userIdReady } = useEsoPayUserId();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  const applyStatus = useCallback(
    (status: {
      configured: boolean;
      locked: boolean;
      attempts_remaining?: number;
      locked_until?: string | null;
    }) => {
      setPinConfigured(status.configured);
      setLocked(status.locked);
      setAttemptsRemaining(
        typeof status.attempts_remaining === 'number' ? status.attempts_remaining : null,
      );
      setLockedUntil(status.locked_until ?? null);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!userIdReady) return;
    if (!userId) {
      setPinConfigured(false);
      setLocked(false);
      setAttemptsRemaining(null);
      setLockedUntil(null);
      setIsChecking(false);
      return;
    }
    setIsChecking(true);
    try {
      const localConfigured = await hasTransactionPin(userId);
      if (apiEnabled) {
        const server = await api.security.getTransactionPinStatus();
        applyStatus({
          ...server,
          // Main app PIN counts — do not force a second “create PIN” flow.
          configured: server.configured || localConfigured,
        });
      } else {
        setPinConfigured(localConfigured);
        setLocked(false);
        setAttemptsRemaining(null);
        setLockedUntil(null);
      }
    } catch {
      setPinConfigured(await hasTransactionPin(userId));
      setLocked(false);
      setAttemptsRemaining(null);
      setLockedUntil(null);
    } finally {
      setIsChecking(false);
    }
  }, [api, apiEnabled, applyStatus, userId, userIdReady]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const configurePin = useCallback(
    async (pin: string, currentPin?: string) => {
      if (!userId) {
        throw new Error('Sign in to Eso Pay before setting a PIN');
      }
      if (apiEnabled) {
        try {
          const result = await api.security.setTransactionPin({
            pin,
            current_pin: currentPin,
          });
          applyStatus(result);
        } catch (error) {
          const apiError = toEsoPayApiError(error);
          if (
            apiError.status === 409 ||
            apiError.code === 'TRANSACTION_PIN_ALREADY_CONFIGURED' ||
            /already/i.test(apiError.message)
          ) {
            setPinConfigured(true);
            unlockPinSession();
            return;
          }
          throw apiError;
        }
      }
      await setTransactionPin(userId, pin);
      const saved = await hasTransactionPin(userId);
      if (!saved) {
        throw new Error('PIN could not be saved on this device');
      }
      setPinConfigured(true);
      setLocked(false);
      setAttemptsRemaining(null);
      setLockedUntil(null);
      unlockPinSession();
    },
    [api, apiEnabled, applyStatus, userId],
  );

  const resetPinForRecovery = useCallback(
    async (pin: string) => {
      if (!userId) {
        throw new Error('Sign in to Eso Pay before resetting your PIN');
      }
      if (apiEnabled) {
        try {
          const result = await api.security.resetTransactionPin({ pin });
          applyStatus(result);
        } catch (error) {
          throw toEsoPayApiError(error);
        }
      }
      await setTransactionPin(userId, pin);
      const saved = await hasTransactionPin(userId);
      if (!saved) {
        throw new Error('PIN could not be saved on this device');
      }
      setPinConfigured(true);
      setLocked(false);
      setAttemptsRemaining(null);
      setLockedUntil(null);
      unlockPinSession();
    },
    [api, apiEnabled, applyStatus, userId],
  );

  /** Sync device master PIN to server when payments require a server-side PIN. */
  const syncMasterPinToServer = useCallback(
    async (pin: string) => {
      if (!userId || !apiEnabled) return;
      try {
        const result = await api.security.setTransactionPin({ pin });
        applyStatus({ ...result, configured: true });
      } catch (error) {
        const apiError = toEsoPayApiError(error);
        if (
          apiError.status === 409 ||
          apiError.code === 'TRANSACTION_PIN_ALREADY_CONFIGURED' ||
          /already/i.test(apiError.message)
        ) {
          setPinConfigured(true);
          return;
        }
        // Non-fatal for unlock; purchase may still fail until synced.
        console.warn('[useTransactionPin] Could not sync master PIN to server', apiError.code);
      }
    },
    [api, apiEnabled, applyStatus, userId],
  );

  const verifyPin = useCallback(
    async (pin: string): Promise<VerifyPinResult> => {
      if (!userId) return { ok: false, attemptsRemaining: null, locked: false };

      if (apiEnabled) {
        try {
          const result = await api.security.verifyTransactionPin({ pin });
          if (result.ok) {
            applyStatus(result);
            await setTransactionPin(userId, pin);
            unlockPinSession();
            return {
              ok: true,
              attemptsRemaining:
                typeof result.attempts_remaining === 'number' ? result.attempts_remaining : null,
              locked: false,
            };
          }

          if (result.locked) {
            applyStatus(result);
            return {
              ok: false,
              attemptsRemaining:
                typeof result.attempts_remaining === 'number' ? result.attempts_remaining : null,
              locked: true,
            };
          }

          // Server has no PIN yet — accept the main device PIN and register it.
          if (!result.configured) {
            const localOk = await verifyTransactionPin(userId, pin);
            if (localOk) {
              await syncMasterPinToServer(pin);
              unlockPinSession();
              setPinConfigured(true);
              return { ok: true, attemptsRemaining: null, locked: false };
            }
            applyStatus(result);
            return {
              ok: false,
              attemptsRemaining:
                typeof result.attempts_remaining === 'number' ? result.attempts_remaining : null,
              locked: false,
            };
          }

          applyStatus(result);
          return {
            ok: false,
            attemptsRemaining:
              typeof result.attempts_remaining === 'number' ? result.attempts_remaining : null,
            locked: false,
          };
        } catch (error) {
          const apiError = toEsoPayApiError(error);
          if (apiError.code === 'TRANSACTION_PIN_LOCKED') {
            void refresh();
            return { ok: false, attemptsRemaining: null, locked: true };
          }
          const localOk = await verifyTransactionPin(userId, pin);
          if (localOk) {
            await syncMasterPinToServer(pin);
            unlockPinSession();
            setPinConfigured(true);
            return { ok: true, attemptsRemaining: null, locked: false };
          }
          void refresh();
          return { ok: false, attemptsRemaining: null, locked: false };
        }
      }

      const localOk = await verifyTransactionPin(userId, pin);
      if (localOk) unlockPinSession();
      return { ok: localOk, attemptsRemaining: null, locked: false };
    },
    [api, apiEnabled, applyStatus, refresh, syncMasterPinToServer, userId],
  );

  return {
    userId,
    userIdReady,
    pinConfigured,
    locked,
    lockedUntil,
    attemptsRemaining,
    isChecking: isChecking || !userIdReady,
    refresh,
    configurePin,
    resetPinForRecovery,
    verifyPin,
  };
}
