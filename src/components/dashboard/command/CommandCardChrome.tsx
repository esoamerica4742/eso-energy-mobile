import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ListeningBlink, PulseStatusBadge } from '@/components/monitoring/WaitingStateMotion';
import { pendingMetricColor } from '@/lib/monitoring/pendingValue';
import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

export const commandCardShell = {
  marginHorizontal: MonitoringLayout.cardMarginH,
  marginBottom: 0,
} as const;

type BadgeProps = {
  eyebrow: string;
  badgeLabel: string;
  badgeAccent: string;
  badgeBg: string;
  badgeBorder: string;
};

export function CommandCardHeader({ eyebrow, badgeLabel, badgeAccent, badgeBg, badgeBorder }: BadgeProps) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <PulseStatusBadge
        label={badgeLabel}
        accent={badgeAccent}
        bg={badgeBg}
        border={badgeBorder}
        badgeStyle={styles.statusBadge}
        textStyle={styles.statusText}
      />
    </View>
  );
}

export function CommandCardTitleBlock({
  title,
  subLabel,
  muted = false,
}: {
  title?: string;
  subLabel: string;
  muted?: boolean;
}) {
  const awaitingTelemetry = subLabel.toUpperCase().includes('AWAITING LIVE TELEMETRY');
  const sub = (
    <Text style={[styles.subLabel, muted && styles.subLabelMuted]}>{subLabel}</Text>
  );

  return (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {awaitingTelemetry ? <ListeningBlink>{sub}</ListeningBlink> : sub}
    </>
  );
}

export function CommandHeroPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.heroPanel}>
      <Text style={styles.heroLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function CommandRaisedPanel({ children }: { children: ReactNode }) {
  return <View style={styles.raisedPanel}>{children}</View>;
}

export function CommandGoldLabel({ children }: { children: string }) {
  return <Text style={styles.goldLabel}>{children}</Text>;
}

export function CommandBreakdownLabel({ children }: { children: string }) {
  return <Text style={styles.breakdownLabel}>{children}</Text>;
}

export function CommandBarTrack({
  label,
  value,
  valueColor,
  fillPct,
  fillColor,
}: {
  label: string;
  value: string;
  valueColor: string;
  fillPct: number;
  fillColor: string;
}) {
  const fill = Math.max(0, Math.min(100, fillPct));
  const displayColor = pendingMetricColor(value, valueColor) ?? valueColor;

  return (
    <View style={styles.barBlock}>
      <View style={styles.barRow}>
        <Text style={styles.goldLabel}>{label}</Text>
        <Text style={[styles.barValue, { color: displayColor }]}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${fill}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

export function CommandHeroScore({
  score,
  scoreColor,
  unit = '/ 100',
  hint,
  trailing,
}: {
  score: string;
  scoreColor: string;
  unit?: string;
  hint: string;
  trailing?: ReactNode;
}) {
  const displayScoreColor = pendingMetricColor(score, scoreColor) ?? scoreColor;

  return (
    <View style={styles.heroScoreRow}>
      <Text style={[styles.heroScore, { color: displayScoreColor }]}>{score}</Text>
      <View style={styles.heroScoreMeta}>
        <Text style={styles.heroScoreUnit}>{unit}</Text>
        <Text style={styles.heroScoreHint}>{hint}</Text>
      </View>
      {trailing ? <View style={styles.heroScoreTrailing}>{trailing}</View> : null}
    </View>
  );
}

export function CommandSparkEyebrow({ children }: { children: string }) {
  return <Text style={styles.sparkEyebrow}>{children}</Text>;
}

export function CommandFlowGrid({ children }: { children: ReactNode }) {
  return <View style={styles.flowGrid}>{children}</View>;
}

export function CommandFlowCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  const displayColor = pendingMetricColor(value, accent ?? Colors.textPrimary);

  return (
    <View style={styles.flowCell}>
      <Text style={[styles.flowValue, { color: displayColor }]}>{value}</Text>
      <Text style={styles.flowLabel}>{label}</Text>
    </View>
  );
}

export function CommandFlowDivider() {
  return <View style={styles.divider} />;
}

export function CommandInlineRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.inlineRow}>
      <Text style={styles.goldLabel}>{label}</Text>
      <Text
        style={[
          styles.inlineValue,
          { color: pendingMetricColor(value, valueColor ?? Colors.textPrimary) },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  subLabel: {
    marginTop: 4,
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    letterSpacing: 1.4,
    color: Colors.gold,
    textTransform: 'uppercase',
  },
  subLabelMuted: {
    color: Colors.goldMuted,
  },
  heroPanel: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    marginBottom: Spacing.md,
    minHeight: 96,
  },
  heroLabel: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  raisedPanel: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    marginBottom: Spacing.md,
  },
  goldLabel: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  breakdownLabel: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  barBlock: {
    marginBottom: Spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  barValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  heroScore: {
    fontFamily: fonts.bold,
    fontSize: FontSize.hero,
    letterSpacing: -1.2,
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
  },
  heroScoreMeta: {
    flex: 1,
    paddingBottom: 6,
  },
  heroScoreUnit: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  heroScoreHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  heroScoreTrailing: {
    alignItems: 'flex-end',
    gap: 4,
    paddingBottom: 4,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  inlineValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
  sparkEyebrow: {
    fontFamily: fonts.medium,
    fontSize: FontSize.micro,
    color: Colors.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  flowGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.md,
  },
  flowCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  flowValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
  flowLabel: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.micro,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
