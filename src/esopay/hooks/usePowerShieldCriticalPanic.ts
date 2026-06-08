import { usePowerShield } from '@/esopay/hooks/usePowerShield';

/** True when any meter is in 5% critical panic (crimson UI on Monitor / Fleet). */
export function usePowerShieldCriticalPanic(): boolean {
  const { data } = usePowerShield();
  if (!data?.meters?.length) return false;
  if (data.summary.worst_alert_level === 'critical') return true;
  return data.meters.some(
    (m) => m.alert_level === 'critical' || m.alert_state === 'critical',
  );
}
