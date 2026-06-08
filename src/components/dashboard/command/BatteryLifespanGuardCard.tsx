import { CardShell } from '@/components/cards/CardShell';

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

import { PerceivedMiniSparkline } from '@/components/perceived/PerceivedMiniSparkline';

import {

  guardBorderVariant,

  type BatteryLifespanSnapshot,

} from '@/lib/batteryLifespanGuard';

import { Colors } from '@/tokens/design';



type Props = {

  snapshot: BatteryLifespanSnapshot;

  streamingLive?: boolean;

  smooth?: boolean;

};



function statusAccent(snapshot: BatteryLifespanSnapshot) {

  if (!snapshot.enabled) return Colors.textMuted;

  if (snapshot.status === 'optimal') return Colors.mint;

  if (snapshot.status === 'watch') return Colors.gold;

  return Colors.alert;

}



function statusBadgeBg(snapshot: BatteryLifespanSnapshot) {

  if (!snapshot.enabled) return Colors.surfaceRaised;

  if (snapshot.status === 'optimal') return Colors.mintGlow;

  if (snapshot.status === 'watch') return Colors.goldWhisper;

  return Colors.alertMuted;

}



function sparklineStatus(snapshot: BatteryLifespanSnapshot): 'live' | 'degraded' | 'offline' {

  if (!snapshot.enabled) return 'offline';

  if (snapshot.status === 'optimal') return 'live';

  return 'degraded';

}



function chargeBarColor(soc: number, enabled: boolean) {

  if (!enabled) return Colors.textMuted;

  if (soc <= 10) return Colors.alert;

  if (soc <= 20) return Colors.gold;

  return Colors.mint;

}



export function BatteryLifespanGuardCard({

  snapshot,

  streamingLive = false,

  smooth = true,

}: Props) {

  const accent = statusAccent(snapshot);

  const scoreColor = snapshot.enabled ? Colors.gold : Colors.textMuted;



  return (

    <CardShell

      glowColor="none"

      borderVariant={guardBorderVariant(snapshot.status, snapshot.enabled)}

      style={commandCardShell}

    >

      <CommandCardHeader

        eyebrow="BATTERY LIFESPAN GUARD"

        badgeLabel={snapshot.statusLabel}

        badgeAccent={accent}

        badgeBg={statusBadgeBg(snapshot)}

        badgeBorder={accent}

      />

      <CommandCardTitleBlock
        subLabel={snapshot.subLabel}
        muted={!snapshot.enabled}
      />



      <CommandHeroPanel label="HEALTH INDEX">

        <CommandHeroScore

          score={snapshot.enabled ? `${snapshot.healthScore}` : '—'}

          scoreColor={scoreColor}

          hint="Health index"

          trailing={

            <>

              <CommandSparkEyebrow>STABILITY</CommandSparkEyebrow>

              <PerceivedMiniSparkline

                metricValue={snapshot.healthScore}

                seed={snapshot.healthTrend}

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

          label="CHARGE LEVEL"

          value={snapshot.enabled ? `${snapshot.socPct}%` : '—'}

          valueColor={chargeBarColor(snapshot.socPct, snapshot.enabled)}

          fillPct={snapshot.enabled ? snapshot.socPct : 0}

          fillColor={chargeBarColor(snapshot.socPct, snapshot.enabled)}

        />

        <CommandInlineRow

          label="PROJECTED RUNWAY"

          value={snapshot.remainingLifeLabel}

          valueColor={accent}

        />

      </CommandRaisedPanel>



      <CommandFlowGrid>

        <CommandFlowCell label="Cycles est." value={snapshot.enabled ? `${snapshot.cycleEstimate}` : '—'} />

        <CommandFlowDivider />

        <CommandFlowCell

          label="Deep cycles"

          value={snapshot.enabled ? `${snapshot.deepCycleCount}` : '—'}

          accent={snapshot.deepCycleCount > 2 ? Colors.alert : undefined}

        />

        <CommandFlowDivider />

        <CommandFlowCell

          label="Temp stress"

          value={snapshot.enabled ? `${snapshot.tempStressPct}%` : '—'}

          accent={snapshot.tempStressPct > 20 ? Colors.gold : undefined}

        />

        <CommandFlowDivider />

        <CommandFlowCell label="Reserve" value={snapshot.enabled ? `${snapshot.reserveMarginPct}%` : '—'} />

      </CommandFlowGrid>

    </CardShell>

  );

}


