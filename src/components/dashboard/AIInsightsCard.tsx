/**
 * Fleet intelligence cards — ML pipeline, live telemetry analysis, or labeled demo samples.
 */
import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonitoringLayout } from '@/tokens/design';
import { BrainCircuit, TrendingDown, Lightbulb, Gauge, ChevronRight } from 'lucide-react-native';
import { INSIGHT_LABELS } from '@/services/supabase/aiInsights';
import type { FleetInsight } from '@/lib/monitoring/fleetInsights';
import type { FleetInsightSourceMix } from '@/hooks/useFleetIntelligence';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  insights: FleetInsight[];
  isLoading: boolean;
  sourceMix?: FleetInsightSourceMix;
};

const TYPE_ICON = {
  anomaly: TrendingDown,
  predictive_failure: Gauge,
  optimization: BrainCircuit,
  efficiency: Lightbulb,
};

const TYPE_COLOR = {
  anomaly: colors.offlineText,
  predictive_failure: colors.warningText,
  optimization: colors.gold,
  efficiency: colors.solarText,
};

const TYPE_BG = {
  anomaly: colors.offlineBg,
  predictive_failure: colors.warningBg,
  optimization: colors.goldBg,
  efficiency: colors.solarBg,
};

function headerBadgeLabel(sourceMix: FleetInsightSourceMix | undefined, count: number): string {
  if (sourceMix === 'ml') return count > 0 ? `${count} ML` : 'ML';
  if (sourceMix === 'telemetry' || sourceMix === 'demo') return count > 0 ? `${count} LIVE` : 'LIVE';
  return 'READY';
}

export const AIInsightsCard = memo(function AIInsightsCard({
  insights,
  isLoading,
  sourceMix = 'none',
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.wrap}>
        <View style={styles.header}>
          <BrainCircuit size={16} color={colors.gold} strokeWidth={1.8} />
          <Text style={styles.headerTitle}>Fleet intelligence</Text>
        </View>
        <View style={styles.loadingRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.loadingItem} />
          ))}
        </View>
      </View>
    );
  }

  if (insights.length === 0) {
    return (
      <View style={styles.wrap}>
        <View style={styles.header}>
          <BrainCircuit size={16} color={colors.gold} strokeWidth={1.8} />
          <Text style={styles.headerTitle}>Fleet intelligence</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>READY</Text>
          </View>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Connect a device and wait for live telemetry. Insights appear from ML when published, or
            instantly from your live stream.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <BrainCircuit size={16} color={colors.gold} strokeWidth={1.8} />
        <Text style={styles.headerTitle}>Fleet intelligence</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{headerBadgeLabel(sourceMix, insights.length)}</Text>
        </View>
      </View>

      {insights.map((insight) => {
        const Icon = TYPE_ICON[insight.type] ?? BrainCircuit;
        const color = TYPE_COLOR[insight.type] ?? colors.gold;
        const bg = TYPE_BG[insight.type] ?? colors.goldBg;
        const scoreLabel = `${Math.round(insight.score * 100)}% confidence`;

        return (
          <View key={insight.id} style={styles.item}>
            <View style={[styles.itemIconWrap, { backgroundColor: bg }]}>
              <Icon size={14} color={color} strokeWidth={2} />
            </View>
            <View style={styles.itemBody}>
              <View style={styles.itemTopRow}>
                <View style={styles.typeRow}>
                  <Text style={[styles.itemType, { color }]}>{INSIGHT_LABELS[insight.type]}</Text>
                </View>
                <Text style={styles.itemScore}>{scoreLabel}</Text>
              </View>
              <Text style={styles.itemMessage}>{insight.message}</Text>
              {insight.recommendation ? (
                <View style={styles.recommendation}>
                  <ChevronRight size={11} color={colors.textTertiary} strokeWidth={2} />
                  <Text style={styles.recommendationText}>{insight.recommendation}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: MonitoringLayout.cardMarginH,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: fontSize.value,
    color: colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 100,
  },
  headerBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.micro,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  itemBody: { flex: 1 },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: spacing.sm,
  },
  typeRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  itemType: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemScore: {
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
  },
  itemMessage: {
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  loadingRow: { padding: spacing.lg, gap: spacing.md },
  loadingItem: {
    height: 56,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.button,
  },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
