import type { LucideIcon } from 'lucide-react-native';
import { BarChart3, FileText, TrendingUp } from 'lucide-react-native';
import { buildSparklineTrend } from '@/lib/siteCoordinates';
import type { BranchRow } from '@/lib/aura';
import type { FleetSite, FleetSummary } from '@/types/fleet';

export type ReportPeriod = '7d' | '30d' | '90d';

export type ReportExportStatus = 'ready' | 'scheduled';

export type ReportExportItem = {
  id: string;
  title: string;
  subtitle: string;
  heroValue: string;
  heroLabel: string;
  format: 'PDF' | 'CSV';
  status: ReportExportStatus;
  trend: number[];
  icon: LucideIcon;
};

export type ReportsSnapshot = {
  period: ReportPeriod;
  performanceIndex: number;
  solarContributionPct: number;
  dieselSavedLabel: string;
  exportReadyCount: number;
  fleetSummary: FleetSummary;
  healthyRatioPct: number;
};

const PERIOD_LABEL: Record<ReportPeriod, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

export function periodLabel(period: ReportPeriod) {
  return PERIOD_LABEL[period];
}

function periodMultiplier(period: ReportPeriod) {
  if (period === '30d') return 4.2;
  if (period === '90d') return 12.5;
  return 1;
}

function formatNaira(value: number) {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}K`;
  return `₦${Math.round(value)}`;
}

export function buildReportsSnapshot(
  branchRows: BranchRow[],
  summary: FleetSummary,
  period: ReportPeriod,
): ReportsSnapshot {
  const multiplier = periodMultiplier(period);
  const totalLoad = branchRows.reduce((sum, row) => sum + row.load, 0);
  const solarLoad = branchRows
    .filter((row) => row.source === 'solar')
    .reduce((sum, row) => sum + row.load, 0);
  const solarContributionPct =
    totalLoad > 0 ? Math.round((solarLoad / totalLoad) * 100) : summary.siteCount > 0 ? 48 : 0;

  const avgUptime =
    branchRows.length === 0
      ? 0
      : branchRows.reduce((sum, row) => sum + row.uptime, 0) / branchRows.length;

  const healthyRatioPct =
    summary.siteCount === 0 ? 0 : Math.round((summary.healthySites / summary.siteCount) * 100);

  const alertPenalty = Math.min(summary.activeAlerts * 4, 24);
  const performanceIndex = Math.max(
    0,
    Math.min(100, Math.round(avgUptime * 0.45 + solarContributionPct * 0.35 + healthyRatioPct * 0.2 - alertPenalty)),
  );

  const dieselBase = totalLoad * 1850 + summary.siteCount * 120_000;
  const dieselSavedLabel = formatNaira(dieselBase * multiplier);

  return {
    period,
    performanceIndex,
    solarContributionPct,
    dieselSavedLabel,
    exportReadyCount: summary.siteCount > 0 ? 3 : 0,
    fleetSummary: summary,
    healthyRatioPct,
  };
}

export function buildReportExports(
  snapshot: ReportsSnapshot,
  fleetSites: FleetSite[],
): ReportExportItem[] {
  const seedSite = fleetSites[0]?.id ?? 'reports-default';
  const loadBase = snapshot.fleetSummary.totalLoadKw || 120;

  return [
    {
      id: 'diesel',
      title: 'Weekly diesel audit',
      subtitle: 'Generator runtime offset vs solar',
      heroValue: snapshot.dieselSavedLabel,
      heroLabel: 'Est. diesel offset',
      format: 'PDF',
      status: 'ready',
      trend: buildSparklineTrend(`${seedSite}-diesel`, loadBase * 0.6),
      icon: TrendingUp,
    },
    {
      id: 'solar',
      title: 'Solar contribution',
      subtitle: 'Renewable share across fleet sites',
      heroValue: `${snapshot.solarContributionPct}%`,
      heroLabel: 'Fleet average',
      format: 'CSV',
      status: 'ready',
      trend: buildSparklineTrend(`${seedSite}-solar`, snapshot.solarContributionPct),
      icon: BarChart3,
    },
    {
      id: 'executive',
      title: 'Executive summary',
      subtitle: 'Board-ready performance brief',
      heroValue: `${snapshot.performanceIndex}`,
      heroLabel: 'Performance index',
      format: 'PDF',
      status: 'ready',
      trend: buildSparklineTrend(`${seedSite}-exec`, snapshot.performanceIndex),
      icon: FileText,
    },
  ];
}
