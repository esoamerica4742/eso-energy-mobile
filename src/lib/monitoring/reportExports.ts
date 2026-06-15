import type { FleetSite } from '@/types/fleet';
import type { ReportsSnapshot } from '@/lib/reportsData';
import { periodLabel } from '@/lib/reportsData';
import { shareMonitoringCsv, shareMonitoringPdf } from '@/lib/monitoring/shareReport';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function reportShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f7f4ef;padding:32px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #d4af37;border-radius:16px;padding:28px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#b8860b;text-transform:uppercase;">ESO Monitoring</div>
      <h1 style="margin:8px 0 0;font-size:26px;color:#111;">${escapeHtml(title)}</h1>
    </div>
    ${bodyHtml}
    <p style="margin-top:28px;font-size:11px;color:#888;text-align:center;line-height:1.5;">
      Figures are telemetry-derived estimates unless your contract specifies audited settlement data.
    </p>
  </div>
</body>
</html>`;
}

export function buildDieselAuditHtml(snapshot: ReportsSnapshot, fleetSites: FleetSite[]): string {
  const rows = fleetSites
    .map(
      (site) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(site.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${site.status}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${Math.round(site.load)} kW</td>
        </tr>`,
    )
    .join('');

  const body = `
    <p style="color:#555;font-size:14px;">Period: <strong>${escapeHtml(periodLabel(snapshot.period))}</strong></p>
    <p style="color:#111;font-size:22px;font-weight:700;margin:16px 0;">${escapeHtml(snapshot.dieselSavedLabel)} <span style="font-size:13px;color:#888;">estimated diesel offset</span></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">
      <thead>
        <tr style="color:#888;text-transform:uppercase;font-size:11px;letter-spacing:1px;">
          <th style="text-align:left;padding-bottom:8px;">Site</th>
          <th style="text-align:right;padding-bottom:8px;">Status</th>
          <th style="text-align:right;padding-bottom:8px;">Load</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="3" style="padding:12px 0;color:#888;">No fleet sites in this period.</td></tr>'}</tbody>
    </table>`;

  return reportShell('Weekly diesel audit', body);
}

export function buildExecutiveSummaryHtml(snapshot: ReportsSnapshot, fleetSites: FleetSite[]): string {
  const body = `
    <p style="color:#555;font-size:14px;">Period: <strong>${escapeHtml(periodLabel(snapshot.period))}</strong></p>
    <div style="display:flex;gap:16px;margin-top:20px;flex-wrap:wrap;">
      <div style="flex:1;min-width:140px;padding:16px;border:1px solid #eee;border-radius:12px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;">Performance index</div>
        <div style="font-size:28px;font-weight:700;color:#111;margin-top:4px;">${snapshot.performanceIndex}</div>
      </div>
      <div style="flex:1;min-width:140px;padding:16px;border:1px solid #eee;border-radius:12px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;">Solar share</div>
        <div style="font-size:28px;font-weight:700;color:#111;margin-top:4px;">${snapshot.solarContributionPct}%</div>
      </div>
      <div style="flex:1;min-width:140px;padding:16px;border:1px solid #eee;border-radius:12px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;">Healthy sites</div>
        <div style="font-size:28px;font-weight:700;color:#111;margin-top:4px;">${snapshot.healthyRatioPct}%</div>
      </div>
    </div>
    <p style="margin-top:20px;color:#555;font-size:14px;line-height:1.6;">
      Fleet: ${snapshot.fleetSummary.siteCount} sites · ${snapshot.fleetSummary.healthySites} healthy ·
      ${snapshot.fleetSummary.activeAlerts} active alerts · ${Math.round(snapshot.fleetSummary.totalLoadKw)} kW total load.
    </p>
    <ul style="margin-top:12px;padding-left:18px;color:#444;font-size:13px;line-height:1.7;">
      ${fleetSites.slice(0, 8).map((s) => `<li>${escapeHtml(s.name)} — ${s.status}, ${Math.round(s.load)} kW</li>`).join('')}
    </ul>`;

  return reportShell('Executive summary', body);
}

export function buildSolarContributionCsv(snapshot: ReportsSnapshot, fleetSites: FleetSite[]): string {
  const header = [
    'site_id',
    'site_name',
    'status',
    'load_kw',
    'solar_contribution_pct',
    'period',
    'fleet_solar_share_pct',
  ].join(',');

  const fleetShare = snapshot.solarContributionPct;
  const rows = fleetSites.map((site) =>
    [
      site.id,
      `"${site.name.replace(/"/g, '""')}"`,
      site.status,
      Math.round(site.load),
      site.source === 'solar' ? 100 : fleetShare,
      snapshot.period,
      fleetShare,
    ].join(','),
  );

  return [header, ...rows].join('\n');
}

export type ReportExportId = 'diesel' | 'solar' | 'executive';

export async function runMonitoringReportExport(
  exportId: ReportExportId,
  snapshot: ReportsSnapshot,
  fleetSites: FleetSite[],
): Promise<void> {
  switch (exportId) {
    case 'diesel':
      await shareMonitoringPdf(
        buildDieselAuditHtml(snapshot, fleetSites),
        'Share diesel audit report',
      );
      return;
    case 'executive':
      await shareMonitoringPdf(
        buildExecutiveSummaryHtml(snapshot, fleetSites),
        'Share executive summary',
      );
      return;
    case 'solar':
      await shareMonitoringCsv(
        buildSolarContributionCsv(snapshot, fleetSites),
        `eso-solar-contribution-${snapshot.period}.csv`,
      );
      return;
    default:
      throw new Error(`Unknown report export: ${exportId}`);
  }
}
