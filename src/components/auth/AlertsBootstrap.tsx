/**
 * Subscribes to fleet alerts app-wide so tab badges stay live.
 */
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';

export function AlertsBootstrap() {
  useRealtimeAlerts();
  return null;
}
