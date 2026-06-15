import { useCallback, useEffect } from 'react';
import type { PowerShieldMeter } from '@/esopay/api/types';
import { useRegisterPowerShieldPush } from '@/esopay/hooks/usePowerShield';
import { registerEsoPayRemotePush } from '@/esopay/lib/esoPayPushRegistration';

type Options = {
  /** When false, skips push registration. */
  enabled?: boolean;
};

/**
 * Registers device for server-driven Power Shield push/SMS (10% / 5% capacity tiers).
 */
export function usePowerShieldNotifications(
  meters: PowerShieldMeter[] | undefined,
  options?: Options,
) {
  const registerPush = useRegisterPowerShieldPush();
  const enabled = options?.enabled !== false && (meters?.length ?? 0) > 0;

  const registerRemote = useCallback(async () => {
    if (!enabled) return false;
    const result = await registerEsoPayRemotePush(registerPush, { powerShieldEnabled: true });
    return result === 'granted';
  }, [enabled, registerPush]);

  useEffect(() => {
    if (!enabled) return;
    void registerRemote();
  }, [enabled, registerRemote]);

  return { registerRemote };
}
