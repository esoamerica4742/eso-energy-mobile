import { CardShell } from '@/components/cards/CardShell';
import { PerceivedMiniSparkline } from '@/components/perceived/PerceivedMiniSparkline';
import {
  CommandBarTrack,
  CommandCardHeader,
  CommandCardTitleBlock,
  CommandFlowCell,
  CommandFlowDivider,
  CommandFlowGrid,
  CommandHeroPanel,
  CommandHeroScore,
  CommandInlineRow,
  CommandRaisedPanel,
  CommandSparkEyebrow,
  commandCardShell,
} from '@/components/dashboard/command/CommandCardChrome';
import {
  auditBadgeBg,
  auditBorderVariant,
  auditStatusAccent,
  type ContractorAuditSnapshot,
} from '@/lib/contractorAuditData';
import { Colors } from '@/tokens/design';

type Props = {
  snapshot: ContractorAuditSnapshot;
  streamingLive?: boolean;
  smooth?: boolean;
};

function sparklineStatus(snapshot: ContractorAuditSnapshot): 'live' | 'degraded' | 'offline' {
  if (!snapshot.enabled) return 'offline';
  if (snapshot.status === 'passed') return 'live';
  return 'degraded';
}

export function ContractorAuditToolCard({
  snapshot,
  streamingLive = false,
  smooth = true,
}: Props) {
  const accent = auditStatusAccent(snapshot.status, snapshot.enabled);
  const scoreColor = snapshot.enabled ? Colors.gold : Colors.textMuted;
  const slaFillColor =
    snapshot.enabled && snapshot.slaAdherencePct >= 95 ? Colors.battery : Colors.warning;

  return (
    <CardShell
      glowColor="none"
      borderVariant={auditBorderVariant(snapshot.status, snapshot.enabled)}
      style={commandCardShell}
    >
      <CommandCardHeader
        eyebrow="CONTRACTOR AUDIT TOOL"
        badgeLabel={snapshot.statusLabel}
        badgeAccent={accent}
        badgeBg={auditBadgeBg(snapshot.status, snapshot.enabled)}
        badgeBorder={accent}
      />
      <CommandCardTitleBlock
        subLabel={snapshot.subLabel}
        muted={!snapshot.enabled}
      />

      <CommandHeroPanel label="COMPLIANCE SCORE">
        <CommandHeroScore
          score={snapshot.enabled ? `${snapshot.complianceScore}` : '—'}
          scoreColor={scoreColor}
          hint="Compliance score"
          trailing={
            <>
              <CommandSparkEyebrow>TREND</CommandSparkEyebrow>
              <PerceivedMiniSparkline
                metricValue={snapshot.complianceScore}
                seed={snapshot.complianceTrend}
                streaming={streamingLive && snapshot.enabled}
                smooth={smooth}
                status={sparklineStatus(snapshot)}
              />
            </>
          }
        />
      </CommandHeroPanel>

      <CommandRaisedPanel>
        <CommandBarTrack
          label="SLA ADHERENCE"
          value={snapshot.enabled ? `${snapshot.slaAdherencePct}%` : '—'}
          valueColor={snapshot.enabled ? Colors.mint : Colors.textMuted}
          fillPct={snapshot.enabled ? snapshot.slaAdherencePct : 0}
          fillColor={slaFillColor}
        />
        <CommandInlineRow
          label="COST VARIANCE"
          value={snapshot.costVarianceLabel}
          valueColor={accent}
        />
      </CommandRaisedPanel>

      <CommandFlowGrid>
        <CommandFlowCell
          label="Findings"
          value={`${snapshot.openFindings}`}
          accent={snapshot.openFindings > 0 ? Colors.alert : undefined}
        />
        <CommandFlowDivider />
        <CommandFlowCell label="Work orders" value={`${snapshot.pendingWorkOrders}`} />
        <CommandFlowDivider />
        <CommandFlowCell label="SLA" value={snapshot.enabled ? `${snapshot.slaAdherencePct}%` : '—'} />
        <CommandFlowDivider />
        <CommandFlowCell label="Status" value={snapshot.statusLabel} accent={accent} />
      </CommandFlowGrid>
    </CardShell>
  );
}
