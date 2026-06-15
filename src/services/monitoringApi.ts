/**
 * ESO Monitoring BFF — alerts, API keys, server reports (enode-api routes).
 */
import { enodeClient } from '@/services/enode';

export type MonitoringApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  scope: 'read_only' | 'read_write' | 'admin';
  expires_at: string;
  last_used_at: string | null;
  created_at: string;
};

export type MonitoringReportsSnapshot = {
  period: '7d' | '30d' | '90d';
  performanceIndex: number;
  solarContributionPct: number;
  dieselSavedKobo: number;
  siteCount: number;
  liveDevices: number;
  generatedAt: string;
  source: string;
};

export const monitoringApi = {
  acknowledgeAlert(alertId: string) {
    return enodeClient.acknowledgeAlert(alertId);
  },

  listApiKeys() {
    return enodeClient.listApiKeys();
  },

  createApiKey(name: string, scope: MonitoringApiKey['scope'] = 'read_only') {
    return enodeClient.createApiKey(name, scope);
  },

  revokeApiKey(keyId: string) {
    return enodeClient.revokeApiKey(keyId);
  },

  getReportsSnapshot(period: '7d' | '30d' | '90d' = '7d') {
    return enodeClient.getReportsSnapshot(period);
  },
};
