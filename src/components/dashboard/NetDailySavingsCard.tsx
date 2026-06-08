import { View, Text, StyleSheet } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import {
  CommandCardHeader,
  CommandCardTitleBlock,
  CommandFlowCell,
  CommandFlowDivider,
  CommandFlowGrid,
  CommandHeroPanel,
  CommandInlineRow,
  CommandRaisedPanel,
  commandCardShell,
} from '@/components/dashboard/command/CommandCardChrome';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { ConnectionStatus, DeltaDir } from '@/types/dashboard';
import { formatMetric, formatKPI } from '@/utils/formatMetric';

type Props = {
  loading?: boolean;
  muted?: boolean;
  connectionStatus?: ConnectionStatus;
  dailySavings: number;
  vsAvg: number;
  monthToDate: number;
  dieselAvoided: number;
  solarShare: number;
  deltaLabel?: string;
  deltaDirection?: DeltaDir;
};

function borderVariantForStatus(status: ConnectionStatus) {
  if (status === 'stale') return 'amber' as const;
  if (status === 'fault') return 'alert' as const;
  if (status === 'offline') return 'muted' as const;
  return 'gold' as const;
}

function statusMeta(status: ConnectionStatus, live: boolean) {
  if (!live) {
    return {
      label: 'PAUSED',
      accent: Colors.warning,
      bg: Colors.warningWhisper,
      border: Colors.warningBorder,
    };
  }
  if (status === 'live') {
    return { label: 'LIVE', accent: Colors.mint, bg: Colors.mintGlow, border: Colors.mintBorder };
  }
  if (status === 'stale') {
    return { label: 'STALE', accent: Colors.warning, bg: Colors.warningWhisper, border: Colors.warningBorder };
  }
  if (status === 'fault') {
    return { label: 'FAULT', accent: Colors.alert, bg: Colors.alertMuted, border: Colors.alertBorder };
  }
  return { label: 'OFFLINE', accent: Colors.textMuted, bg: Colors.surfaceRaised, border: Colors.borderSubtle };
}

function formatDailyHero(value: number, live: boolean) {
  const formatted = formatKPI(value);
  return live ? formatted : '—';
}

export function NetDailySavingsCard({
  loading = false,
  muted = false,
  connectionStatus = 'live',
  dailySavings,
  vsAvg,
  monthToDate,
  dieselAvoided,
  solarShare,
  deltaLabel = 'VS 7-DAY AVG',
  deltaDirection = 'up',
}: Props) {
  const live = connectionStatus === 'live' && !muted;
  const meta = statusMeta(connectionStatus, live);
  const positive = deltaDirection === 'up';
  const deltaAccent = !live
    ? Colors.textMuted
    : positive
      ? Colors.mint
      : Colors.gold;
  const deltaPrefix = positive ? '+' : '−';

  return (
    <CardShell
      glowColor="none"
      borderVariant={borderVariantForStatus(connectionStatus)}
      style={commandCardShell}
    >
      <CommandCardHeader
        eyebrow={live ? 'NET DAILY SAVINGS · EST.' : 'NET DAILY SAVINGS'}
        badgeLabel={meta.label}
        badgeAccent={meta.accent}
        badgeBg={meta.bg}
        badgeBorder={meta.border}
      />
      <CommandCardTitleBlock
        subLabel="Solar vs diesel · 24h rolling"
        muted={!live}
      />

      {loading ? (
        <SavingsSkeleton />
      ) : (
        <>
          <CommandHeroPanel label="TODAY">
            <View style={styles.heroRow}>
              <Text style={[styles.heroCurrency, !live && styles.muted]}>₦</Text>
              <Text style={[styles.heroAmount, !live && styles.muted]} numberOfLines={1}>
                {formatDailyHero(dailySavings, live)}
              </Text>
            </View>
          </CommandHeroPanel>

          <CommandRaisedPanel>
            <CommandInlineRow
              label={deltaLabel}
              value={`${deltaPrefix}${vsAvg.toFixed(1)}%`}
              valueColor={deltaAccent}
            />
          </CommandRaisedPanel>

          <CommandFlowGrid>
            <CommandFlowCell
              label="MTD"
              value={live ? formatMetric(monthToDate, '₦', true) : '—'}
              accent={live ? Colors.textPrimary : Colors.textMuted}
            />
            <CommandFlowDivider />
            <CommandFlowCell
              label="Diesel avoided"
              value={live ? `${dieselAvoided}L` : '—'}
              accent={live ? Colors.gold : Colors.textMuted}
            />
            <CommandFlowDivider />
            <CommandFlowCell
              label="Solar share"
              value={live ? `${solarShare}%` : '—'}
              accent={live ? Colors.gold : Colors.textMuted}
            />
          </CommandFlowGrid>
        </>
      )}
    </CardShell>
  );
}

function SavingsSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      <View style={[styles.skeleton, styles.skelHero]} />
      <View style={[styles.skeleton, styles.skelRaised]} />
      <View style={styles.skeletonRow}>
        <View style={[styles.skeleton, styles.skelCell]} />
        <View style={[styles.skeleton, styles.skelCell]} />
        <View style={[styles.skeleton, styles.skelCell]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  heroCurrency: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.gold,
    lineHeight: 40,
    paddingBottom: 4,
  },
  heroAmount: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: FontSize.hero,
    letterSpacing: -1.2,
    lineHeight: 56,
    color: Colors.gold,
    fontVariant: ['tabular-nums'],
  },
  muted: {
    color: Colors.textMuted,
  },
  skeletonWrap: {
    gap: Spacing.md,
  },
  skeleton: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
  },
  skelHero: {
    height: 96,
  },
  skelRaised: {
    height: 52,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.md,
  },
  skelCell: {
    flex: 1,
    height: 44,
  },
});
