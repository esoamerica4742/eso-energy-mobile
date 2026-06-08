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
  dieselAuditBadgeBg,
  dieselAuditBorderVariant,
  dieselAuditStatusAccent,
  type DieselFraudAuditSnapshot,
} from '@/lib/dieselFraudAuditData';
import { Colors } from '@/tokens/design';

type Props = {
  snapshot: DieselFraudAuditSnapshot;
  streamingLive?: boolean;
  smooth?: boolean;
};

function sparklineStatus(snapshot: DieselFraudAuditSnapshot): 'live' | 'degraded' | 'offline' {
  if (!snapshot.enabled) return 'offline';
  if (snapshot.status === 'clear') return 'live';
  return 'degraded';
}

export function DieselFraudAuditHubCard({
  snapshot,
  streamingLive = false,
  smooth = true,
}: Props) {
  const accent = dieselAuditStatusAccent(snapshot.status, snapshot.enabled);
  const scoreColor = snapshot.enabled ? Colors.gold : Colors.textMuted;

  return (
    <CardShell
      glowColor="none"
      borderVariant={dieselAuditBorderVariant(snapshot.status, snapshot.enabled)}
      style={commandCardShell}
    >
      <CommandCardHeader
        eyebrow="DIESEL FRAUD AUDIT HUB"
        badgeLabel={snapshot.statusLabel}
        badgeAccent={accent}
        badgeBg={dieselAuditBadgeBg(snapshot.status, snapshot.enabled)}
        badgeBorder={accent}
      />
      <CommandCardTitleBlock
        subLabel={snapshot.subLabel}
        muted={!snapshot.enabled}
      />

      <CommandHeroPanel label="INTEGRITY SCORE">
        <CommandHeroScore
          score={snapshot.enabled ? `${snapshot.integrityScore}` : '—'}
          scoreColor={scoreColor}
          hint="Integrity score"
          trailing={
            <>
              <CommandSparkEyebrow>LEDGER</CommandSparkEyebrow>
              <PerceivedMiniSparkline
                metricValue={snapshot.integrityScore}
                seed={snapshot.auditTrend}
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
          label="SOLAR OFFSET"
          value={snapshot.enabled ? `${snapshot.solarOffsetPct}%` : '—'}
          valueColor={snapshot.enabled ? Colors.mint : Colors.textMuted}
          fillPct={snapshot.enabled ? snapshot.solarOffsetPct : 0}
          fillColor={snapshot.enabled ? Colors.mint : Colors.textMuted}
        />
        <CommandBarTrack
          label="LEDGER INTEGRITY"
          value={snapshot.enabled ? `${snapshot.integrityScore}%` : '—'}
          valueColor={scoreColor}
          fillPct={snapshot.enabled ? snapshot.integrityScore : 0}
          fillColor={snapshot.enabled ? Colors.gold : Colors.textMuted}
        />
        <CommandInlineRow
          label="FRAUD EXPOSURE"
          value={snapshot.exposureLabel}
          valueColor={accent}
        />
      </CommandRaisedPanel>

      <CommandFlowGrid>
        <CommandFlowCell label="Avoided" value={`${snapshot.dieselAvoidedLiters}L`} />
        <CommandFlowDivider />
        <CommandFlowCell
          label="Variance"
          value={`${snapshot.variancePct}%`}
          accent={snapshot.variancePct > 12 ? Colors.gold : undefined}
        />
        <CommandFlowDivider />
        <CommandFlowCell
          label="Anomalies"
          value={`${snapshot.anomalyCount}`}
          accent={snapshot.anomalyCount > 0 ? Colors.alert : undefined}
        />
        <CommandFlowDivider />
        <CommandFlowCell label="Entries" value={`${snapshot.ledgerEntries}`} />
      </CommandFlowGrid>
    </CardShell>
  );
}
