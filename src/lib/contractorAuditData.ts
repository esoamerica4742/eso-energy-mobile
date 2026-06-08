import { Colors } from '@/tokens/design';
import type { TelemetryPoint } from '@/stores/telemetryStore';

export type ContractorAuditStatus = 'passed' | 'review' | 'flagged';

export type ContractorAuditSnapshot = {
  enabled: boolean;
  title: string;
  subLabel: string;
  complianceScore: number;
  status: ContractorAuditStatus;
  statusLabel: string;
  slaAdherencePct: number;
  openFindings: number;
  pendingWorkOrders: number;
  costVarianceLabel: string;
  lastAuditLabel: string;
  contractorName: string;
  complianceTrend: number[];
  recommendation: string;
};

const STATUS_LABEL: Record<ContractorAuditStatus, string> = {
  passed: 'PASSED',
  review: 'REVIEW',
  flagged: 'FLAGGED',
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatNaira(value: number) {
  const abs = Math.abs(value);
  const prefix = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${prefix}₦${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${prefix}₦${Math.round(abs / 1_000)}K`;
  return `${prefix}₦${Math.round(abs)}`;
}

function resolveStatus(score: number): ContractorAuditStatus {
  if (score >= 88) return 'passed';
  if (score >= 70) return 'review';
  return 'flagged';
}

function uptimeFromHistory(history: TelemetryPoint[], live: boolean) {
  if (!live || history.length === 0) return 0;
  const fresh = history.filter((point) => {
    const ageMs = Date.now() - new Date(point.timestamp).getTime();
    return !Number.isNaN(ageMs) && ageMs <= 5 * 60 * 1000;
  }).length;
  return clamp(Math.round((fresh / history.length) * 100), 55, 100);
}

function complianceTrend(history: TelemetryPoint[], score: number, live: boolean) {
  if (history.length >= 4) {
    const chunk = Math.max(1, Math.floor(history.length / 10));
    const trend: number[] = [];
    for (let i = chunk; i <= history.length; i += chunk) {
      const slice = history.slice(Math.max(0, i - chunk), i);
      const avgLoad = slice.reduce((sum, p) => sum + p.load_kw, 0) / slice.length;
      const stable = slice.every((p) => p.load_kw > 0);
      trend.push(clamp(Math.round(72 + (stable ? 18 : 8) + Math.min(avgLoad / 40, 10)), 45, 100));
    }
    return trend.length >= 2 ? trend : [score, score];
  }
  return live ? [score] : [];
}

function recommendation(input: {
  status: ContractorAuditStatus;
  openFindings: number;
  slaAdherencePct: number;
  live: boolean;
}) {
  if (!input.live) {
    return 'Audit ledger paused until live site telemetry returns.';
  }
  if (input.status === 'flagged') {
    return 'Contractor SLA breach detected — schedule corrective maintenance review.';
  }
  if (input.openFindings > 0) {
    return `${input.openFindings} open finding(s) require sign-off before next billing cycle.`;
  }
  if (input.slaAdherencePct < 95) {
    return 'Uptime margin is narrowing — confirm contractor response window.';
  }
  return 'Contractor performance is within audit tolerance for this site.';
}

export function buildContractorAuditSnapshot(input: {
  live: boolean;
  siteId?: string;
  siteName?: string | null;
  loadKw?: number | null;
  powerKw?: number | null;
  deviceCount: number;
  alertCount: number;
  dailySavings?: number;
  history?: TelemetryPoint[];
}): ContractorAuditSnapshot {
  const history = input.history ?? [];
  const loadKw = input.loadKw ?? 0;
  const powerKw = input.powerKw ?? 0;
  const contractorName = input.siteName ? `${input.siteName} Ops` : 'Fleet contractor';

  const slaAdherencePct = input.live ? uptimeFromHistory(history, input.live) : 0;
  const openFindings = input.live ? Math.min(input.alertCount, 6) : 0;
  const pendingWorkOrders = input.live
    ? clamp(Math.round(input.deviceCount * 0.4 + openFindings), 0, 9)
    : 0;

  const expectedLoad = Math.max(powerKw * 1.08, 120);
  const variance = input.live ? Math.round((expectedLoad - loadKw) * 185_000) : 0;
  const costVarianceLabel = input.live
    ? variance >= 0
      ? `${formatNaira(variance)} under`
      : `${formatNaira(variance)} over`
    : '—';

  let complianceScore = input.live ? 94 : 0;
  complianceScore -= openFindings * 6;
  complianceScore -= Math.max(0, 98 - slaAdherencePct) * 1.4;
  if (input.deviceCount === 0) complianceScore -= 20;
  if (loadKw <= 0 && input.live) complianceScore -= 12;
  complianceScore = clamp(Math.round(complianceScore), 0, 100);

  const status = input.live ? resolveStatus(complianceScore) : 'review';
  const lastAuditLabel = input.live ? 'Last 24h rolling' : 'Awaiting sync';

  return {
    enabled: input.live,
    title: contractorName,
    subLabel: input.live ? 'COMPLIANCE AUDIT · 24H ROLLING' : 'AWAITING LIVE TELEMETRY',
    complianceScore,
    status,
    statusLabel: input.live ? STATUS_LABEL[status] : 'STANDBY',
    slaAdherencePct,
    openFindings,
    pendingWorkOrders,
    costVarianceLabel,
    lastAuditLabel,
    contractorName,
    complianceTrend: complianceTrend(history, complianceScore, input.live),
    recommendation: recommendation({ status, openFindings, slaAdherencePct, live: input.live }),
  };
}

export function auditBorderVariant(status: ContractorAuditStatus, enabled: boolean) {
  if (!enabled) return 'muted' as const;
  if (status === 'flagged') return 'alert' as const;
  if (status === 'review') return 'amber' as const;
  return 'gold' as const;
}

export function auditStatusAccent(status: ContractorAuditStatus, enabled: boolean) {
  if (!enabled) return Colors.textMuted;
  if (status === 'passed') return Colors.mint;
  if (status === 'review') return Colors.warning;
  return Colors.alert;
}

export function auditBadgeBg(status: ContractorAuditStatus, enabled: boolean) {
  if (!enabled) return Colors.surfaceRaised;
  if (status === 'passed') return Colors.mintGlow;
  if (status === 'review') return Colors.warningWhisper;
  return Colors.alertMuted;
}
