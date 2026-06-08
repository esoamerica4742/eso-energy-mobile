import { View, Text, StyleSheet } from 'react-native';
import { PulseStatusBadge } from '@/components/monitoring/WaitingStateMotion';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  readingCount: number;
  lastReadingAgo: string;
  isLive: boolean;
  timeRangeLabel: string;
};

function statusMeta(live: boolean) {
  if (live) {
    return { label: 'LIVE', accent: Colors.mint, bg: Colors.mintGlow, border: Colors.mintBorder };
  }
  return {
    label: 'PAUSED',
    accent: Colors.warning,
    bg: Colors.warningWhisper,
    border: Colors.warningBorder,
  };
}

export function ChartHeader({ readingCount, lastReadingAgo, isLive, timeRangeLabel }: Props) {
  const meta = statusMeta(isLive);
  const windowLabel = timeRangeLabel.toUpperCase().replace(/\s+/g, '');

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>LIVE TELEMETRY</Text>
        <PulseStatusBadge
          label={meta.label}
          accent={meta.accent}
          bg={meta.bg}
          border={meta.border}
          badgeStyle={styles.statusBadge}
          textStyle={styles.statusText}
        />
      </View>

      <Text style={styles.sectionLabel}>{windowLabel} WINDOW · MULTI-SIGNAL</Text>
      <Text style={[styles.meta, !isLive && styles.metaMuted]}>
        {`${readingCount} readings · ${lastReadingAgo}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  eyebrow: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  metaMuted: {
    color: Colors.textMuted,
  },
});
