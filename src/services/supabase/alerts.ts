/**
 * Alerts service — Enode alert feed + realtime subscription.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Alert, AlertSeverity } from '@/stores/alertStore';

type DbEnodeAlert = {
  id: string;
  company_id: string;
  device_id: string | null;
  severity: AlertSeverity;
  alert_type: string;
  title: string;
  message: string;
  resolved_at: string | null;
  created_at: string;
  enode_devices: { branch_id: string | null } | { branch_id: string | null }[] | null;
};

function deviceBranchId(
  relation: DbEnodeAlert['enode_devices'],
): string {
  if (!relation) return '';
  const row = Array.isArray(relation) ? relation[0] : relation;
  return row?.branch_id ?? '';
}

function rowToAlert(row: DbEnodeAlert): Alert {
  return {
    id: row.id,
    device_id: row.device_id ?? '',
    site_id: deviceBranchId(row.enode_devices),
    severity: row.severity,
    message: row.title,
    detail: row.message,
    timestamp: row.created_at,
    acknowledged: Boolean(row.resolved_at),
  };
}

const ALERT_SELECT =
  'id, company_id, device_id, severity, alert_type, title, message, resolved_at, created_at, enode_devices(branch_id)';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_ALERT_LIMIT = 50;
const MAX_ALERT_LIMIT = 100;

function logAlertsDebug(message: string, detail?: string) {
  if (!__DEV__) return;
  if (detail) {
    console.debug(`[alerts] ${message}: ${detail}`);
    return;
  }
  console.debug(`[alerts] ${message}`);
}

function parseCompanyId(companyId: unknown): string | null {
  if (typeof companyId !== 'string') return null;
  const trimmed = companyId.trim();
  if (!trimmed || !UUID_RE.test(trimmed)) return null;
  return trimmed;
}

function parseAlertId(alertId: unknown): string | null {
  return parseCompanyId(alertId);
}

function parseLimit(limit: unknown): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return DEFAULT_ALERT_LIMIT;
  const rounded = Math.floor(limit);
  if (rounded < 1) return DEFAULT_ALERT_LIMIT;
  return Math.min(rounded, MAX_ALERT_LIMIT);
}

/** Fetch recent unresolved alerts for a company, newest first. */
export async function fetchAlerts(companyId: string, limit = DEFAULT_ALERT_LIMIT): Promise<Alert[]> {
  const tenantId = parseCompanyId(companyId);
  if (!tenantId) {
    logAlertsDebug('fetchAlerts skipped — invalid companyId');
    return [];
  }

  const safeLimit = parseLimit(limit);

  try {
    const { data, error } = await supabase
      .from('enode_alerts')
      .select(ALERT_SELECT)
      .eq('company_id', tenantId)
      .is('resolved_at', null)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) {
      logAlertsDebug('fetchAlerts', error.message);
      return [];
    }

    return ((data ?? []) as DbEnodeAlert[]).map(rowToAlert);
  } catch (err) {
    logAlertsDebug(
      'fetchAlerts',
      err instanceof Error ? err.message : 'unexpected error',
    );
    return [];
  }
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  const resolvedAlertId = parseAlertId(alertId);
  if (!resolvedAlertId) {
    logAlertsDebug('acknowledge skipped — invalid alertId');
    return;
  }

  try {
    const { error } = await supabase
      .from('enode_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', resolvedAlertId);

    if (error) {
      logAlertsDebug('acknowledge', error.message);
    }
  } catch (err) {
    logAlertsDebug(
      'acknowledge',
      err instanceof Error ? err.message : 'unexpected error',
    );
  }
}

export function subscribeToAlerts(
  companyId: string,
  handlers: {
    onInsert: (alert: Alert) => void;
    onResolve?: (alertId: string) => void;
  },
): RealtimeChannel {
  const tenantId = parseCompanyId(companyId);
  if (!tenantId) {
    logAlertsDebug('subscribeToAlerts skipped — invalid companyId');
    return supabase.channel('enode-alerts:invalid');
  }

  return supabase
    .channel(`enode-alerts:company:${tenantId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'enode_alerts',
        filter: `company_id=eq.${tenantId}`,
      },
      (payload) => {
        if (!payload.new) return;
        const alert = rowToAlert(payload.new as DbEnodeAlert);
        if (!alert.acknowledged) handlers.onInsert(alert);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'enode_alerts',
        filter: `company_id=eq.${tenantId}`,
      },
      (payload) => {
        const row = payload.new as DbEnodeAlert | null;
        if (!row?.resolved_at) return;
        handlers.onResolve?.(row.id);
      },
    )
    .subscribe();
}
