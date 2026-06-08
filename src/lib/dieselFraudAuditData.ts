import { Colors } from '@/tokens/design';
import type { TelemetryPoint } from '@/stores/telemetryStore';

export type DieselFraudAuditStatus = 'clear' | 'review' | 'flagged';

export type DieselFraudAuditSnapshot = {
  enabled: boolean;
  title: string;
  subLabel: string;
  integrityScore: number;
  status: DieselFraudAuditStatus;
  statusLabel: string;
  dieselAvoidedLiters: number;
  reportedLiters: number;
  variancePct: number;
  exposureLabel: string;
  solarOffsetPct: number;
  anomalyCount: number;
  ledgerEntries: number;
  auditTrend: number[];
  ledgerLabel: string;
  recommendation: string;
};

const STATUS_LABEL: Record<DieselFraudAuditStatus, string> = {
  clear: 'CLEAR',
  review: 'REVIEW',
  flagged: 'FLAGGED',
};

const DIESEL_RATE_NAIRA_PER_L = 1180;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatNaira(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `₦${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₦${Math.round(abs / 1_000)}K`;
  return `₦${Math.round(abs)}`;
}

function resolveStatus(score: number): DieselFraudAuditStatus {
  if (score >= 88) return 'clear';
  if (score >= 70) return 'review';
  return 'flagged';
}

function solarOffsetPct(loadKw: number, powerKw: number) {
  if (loadKw <= 0) return 0;
  return clamp(Math.round((powerKw / loadKw) * 100), 0, 100);
}

function expectedDieselLiters(loadKw: number, powerKw: number) {
  const dieselDraw = Math.max(0, loadKw - powerKw * 0.92);
  return Math.round(dieselDraw * 3.8);
}

function countAnomalies(history: TelemetryPoint[], loadKw: number, powerKw: number) {
  if (history.length < 2) return 0;
  let anomalies = 0;
  for (let i = 1; i < history.length; i += 1) {
    const prev = history[i - 1];
    const curr = history[i];
    const loadJump = (curr.load_kw ?? 0) - (prev.load_kw ?? 0);
    const solarFlat = Math.abs((curr.power_kw ?? 0) - (prev.power_kw ?? 0)) < 8;
    if (loadJump > 45 && solarFlat) anomalies += 1;
  }
  if (loadKw > 0 && powerKw < loadKw * 0.25) anomalies += 1;
  return anomalies;
}

function auditTrend(history: TelemetryPoint[], siteId: string, score: number) {
  if (history.length >= 4) {
    const chunk = Math.max(1, Math.floor(history.length / 10));
    const trend: number[] = [];
    for (let i = chunk; i <= history.length; i += chunk) {
      const slice = history.slice(Math.max(0, i - chunk), i);
      const avgLoad = slice.reduce((sum, p) => sum + p.load_kw, 0) / slice.length;
      const avgSolar = slice.reduce((sum, p) => sum + p.power_kw, 0) / slice.length;
      const variance = Math.abs(expectedDieselLiters(avgLoad, avgSolar) - avgLoad * 1.2);
      trend.push(clamp(Math.round(score - variance * 0.08), 35, 100));
    }
    return trend.length >= 2 ? trend : [score, score];
  }
  return [score, score];
}

function recommendation(input: {
  status: DieselFraudAuditStatus;
  variancePct: number;
  anomalyCount: number;
  live: boolean;
}) {
  if (!input.live) {
    return 'Fraud audit ledger paused until live telemetry returns.';
  }
  if (input.status === 'flagged') {
    return 'Material diesel ledger mismatch — escalate to finance and re-baseline contractor logs.';
  }
  if (input.anomalyCount > 1) {
    return 'Load spikes without solar offset detected — request generator runtime receipts.';
  }
  if (input.variancePct > 12) {
    return 'Reported diesel savings diverge from telemetry — schedule spot audit this cycle.';
  }
  return 'Diesel offset ledger reconciles with live solar contribution.';
}

export function buildDieselFraudAuditHub(input: {
  live: boolean;
  siteId?: string;
  loadKw?: number | null;
  powerKw?: number | null;
  dieselAvoidedLiters?: number;
  alertCount?: number;
  history?: TelemetryPoint[];
}): DieselFraudAuditSnapshot {
  const history = input.history ?? [];
  const loadKw = input.loadKw ?? 0;
  const powerKw = input.powerKw ?? 0;
  const siteId = input.siteId ?? 'diesel-audit';

  const expectedLiters = expectedDieselLiters(loadKw, powerKw);
  const reportedLiters = input.live
    ? Math.max(0, Math.round(input.dieselAvoidedLiters ?? expectedLiters * 0.88))
    : 0;
  const variancePct =
    input.live && expectedLiters > 0
      ? Math.round((Math.abs(reportedLiters - expectedLiters) / expectedLiters) * 100)
      : 0;

  const offsetPct = solarOffsetPct(loadKw, powerKw);
  const anomalies = input.live ? countAnomalies(history, loadKw, powerKw) : 0;
  const alertPenalty = Math.min(input.alertCount ?? 0, 4) * 5;

  let integrityScore = input.live ? 96 : 0;
  integrityScore -= Math.min(28, variancePct * 1.6);
  integrityScore -= anomalies * 9;
  integrityScore -= alertPenalty;
  if (offsetPct < 35 && loadKw > 120) integrityScore -= 10;
  integrityScore = clamp(Math.round(integrityScore), 0, 100);

  const status = input.live ? resolveStatus(integrityScore) : 'review';
  const exposureLiters = input.live ? Math.max(0, Math.round(Math.abs(reportedLiters - expectedLiters))) : 0;
  const exposureLabel = input.live ? formatNaira(exposureLiters * DIESEL_RATE_NAIRA_PER_L) : '—';

  return {
    enabled: input.live,
    title: 'Diesel Integrity Ledger',
    subLabel: input.live ? 'GRID LEDGER · 24H ROLLING' : 'AWAITING LIVE TELEMETRY',
    integrityScore,
    status,
    statusLabel: input.live ? STATUS_LABEL[status] : 'STANDBY',
    dieselAvoidedLiters: reportedLiters,
    reportedLiters,
    variancePct,
    exposureLabel,
    solarOffsetPct: offsetPct,
    anomalyCount: anomalies,
    ledgerEntries: input.live ? clamp(history.length + 12, 12, 240) : 0,
    auditTrend: auditTrend(history, siteId, integrityScore),
    ledgerLabel: input.live ? 'Grid ledger · 24h rolling' : 'Awaiting sync',
    recommendation: recommendation({ status, variancePct, anomalyCount: anomalies, live: input.live }),
  };
}

export function dieselAuditBorderVariant(status: DieselFraudAuditStatus, enabled: boolean) {
  if (!enabled) return 'muted' as const;
  if (status === 'flagged') return 'alert' as const;
  if (status === 'review') return 'amber' as const;
  return 'gold' as const;
}

export function dieselAuditStatusAccent(status: DieselFraudAuditStatus, enabled: boolean) {
  if (!enabled) return Colors.textMuted;
  if (status === 'clear') return Colors.mint;
  if (status === 'review') return Colors.gold;
  return Colors.alert;
}

export function dieselAuditBadgeBg(status: DieselFraudAuditStatus, enabled: boolean) {
  if (!enabled) return Colors.surfaceRaised;
  if (status === 'clear') return Colors.mintGlow;
  if (status === 'review') return Colors.goldWhisper;
  return Colors.alertMuted;
}
