import { StyleSheet, Text, View } from 'react-native';
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
  CommandRaisedPanel,
  CommandSparkEyebrow,
  commandCardShell,
} from '@/components/dashboard/command/CommandCardChrome';
import {
  formatLoadLabel,
  formatTempLabel,
  stressBadgeBg,
  stressBorderVariant,
  stressStatusAccent,
  type ThermalLoadStressSnapshot,
} from '@/lib/thermalLoadStressAlert';
import { Colors, FontSize } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  snapshot: ThermalLoadStressSnapshot;
  streamingLive?: boolean;
  smooth?: boolean;
};

function headroomColor(pct: number, enabled: boolean) {
  if (!enabled) return Colors.textMuted;
  if (pct >= 55) return Colors.mint;
  if (pct >= 30) return Colors.gold;
  return Colors.alert;
}

function sparklineStatus(snapshot: ThermalLoadStressSnapshot): 'live' | 'degraded' | 'offline' {
  if (!snapshot.enabled) return 'offline';
  if (snapshot.status === 'clear') return 'live';
  return 'degraded';
}

export function ThermalLoadStressAlertCard({
  snapshot,
  streamingLive = false,
  smooth = true,
}: Props) {
  const accent = stressStatusAccent(snapshot.status, snapshot.enabled);
  const scoreColor = snapshot.enabled ? Colors.gold : Colors.textMuted;

  return (
    <CardShell
      glowColor="none"
      borderVariant={stressBorderVariant(snapshot.status, snapshot.enabled)}
      style={commandCardShell}
    >
      <CommandCardHeader
        eyebrow="THERMAL & LOAD STRESS ALERT"
        badgeLabel={snapshot.statusLabel}
        badgeAccent={accent}
        badgeBg={stressBadgeBg(snapshot.status, snapshot.enabled)}
        badgeBorder={accent}
      />
      <CommandCardTitleBlock
        subLabel={snapshot.subLabel}
        muted={!snapshot.enabled}
      />

      <CommandHeroPanel label="SAFETY MARGIN">
        <CommandHeroScore
          score={snapshot.enabled ? `${snapshot.safetyMargin}` : '—'}
          scoreColor={scoreColor}
          hint="Safety margin"
          trailing={
            <>
              <CommandSparkEyebrow>STRESS</CommandSparkEyebrow>
              <PerceivedMiniSparkline
                metricValue={snapshot.safetyMargin}
                seed={snapshot.stressTrend}
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
          label="THERMAL HEADROOM"
          value={formatTempLabel(snapshot.temperatureC)}
          valueColor={headroomColor(snapshot.thermalHeadroomPct, snapshot.enabled)}
          fillPct={snapshot.enabled ? snapshot.thermalHeadroomPct : 0}
          fillColor={headroomColor(snapshot.thermalHeadroomPct, snapshot.enabled)}
        />
        <CommandBarTrack
          label="LOAD HEADROOM"
          value={snapshot.enabled ? formatLoadLabel(snapshot.loadKw) : '—'}
          valueColor={headroomColor(snapshot.loadHeadroomPct, snapshot.enabled)}
          fillPct={snapshot.enabled ? snapshot.loadHeadroomPct : 0}
          fillColor={headroomColor(snapshot.loadHeadroomPct, snapshot.enabled)}
        />
        <View style={styles.peakRow}>
          <View style={styles.peakCell}>
            <Text style={styles.peakLabel}>PEAK TEMP</Text>
            <Text style={styles.peakValue}>{formatTempLabel(snapshot.peakTemperatureC)}</Text>
          </View>
          <View style={styles.peakDivider} />
          <View style={styles.peakCell}>
            <Text style={styles.peakLabel}>PEAK LOAD</Text>
            <Text style={styles.peakValue}>
              {snapshot.enabled ? formatLoadLabel(snapshot.peakLoadKw) : '—'}
            </Text>
          </View>
        </View>
      </CommandRaisedPanel>

      <CommandFlowGrid>
        <CommandFlowCell
          label="Thermal"
          value={`${snapshot.thermalStressPct}%`}
          accent={snapshot.thermalStressPct > 18 ? Colors.gold : undefined}
        />
        <CommandFlowDivider />
        <CommandFlowCell
          label="Load"
          value={`${snapshot.loadStressPct}%`}
          accent={snapshot.loadStressPct > 18 ? Colors.gold : undefined}
        />
        <CommandFlowDivider />
        <CommandFlowCell
          label="Alerts"
          value={`${snapshot.activeAlerts}`}
          accent={snapshot.activeAlerts > 0 ? Colors.alert : undefined}
        />
        <CommandFlowDivider />
        <CommandFlowCell label="Status" value={snapshot.statusLabel} accent={accent} />
      </CommandFlowGrid>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  peakRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 4,
  },
  peakCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peakDivider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
  peakLabel: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  peakValue: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
});
