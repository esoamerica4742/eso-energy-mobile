import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { ChartHeader } from '@/components/chart/ChartHeader';
import { ChartYAxis } from '@/components/chart/ChartYAxis';
import { ChartXAxis } from '@/components/chart/ChartXAxis';
import { TelemetryChart } from '@/components/chart/TelemetryChart';
import { LiveTelemetryVictoryChart } from '@/components/chart/LiveTelemetryVictoryChart';
import { ChartLegend } from '@/components/chart/ChartLegend';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { TelemetryData } from '@/types/telemetry';

type Props = {
  data: TelemetryData;
  skiaChart?: boolean;
  animateChart?: boolean;
  faultTint?: boolean;
};

export const LiveTelemetryCard = memo(function LiveTelemetryCard({
  data,
  skiaChart = true,
  animateChart = true,
  faultTint = false,
}: Props) {
  const { dimensions, onLayout } = useChartDimensions();
  const live = data.isLive;

  return (
    <CardShell glowColor="none" borderVariant={live ? 'gold' : 'muted'} style={styles.shell}>
      <ChartHeader
        readingCount={data.readingCount}
        lastReadingAgo={data.lastReadingAgo}
        isLive={live}
        timeRangeLabel={data.timeRangeLabel}
      />

      <View style={styles.chartPanel}>
        <View style={styles.chartArea} onLayout={onLayout}>
          {dimensions ? (
            <View style={styles.chartRow}>
              <ChartYAxis
                yMin={data.yMin}
                yMax={data.yMax}
                unit={data.yUnit}
                height={dimensions.plotHeight}
              />
              <View style={styles.plotColumn}>
                {skiaChart ? (
                  <LiveTelemetryVictoryChart
                    series={data.series}
                    yMin={data.yMin}
                    yMax={data.yMax}
                    height={dimensions.plotHeight}
                    animate={animateChart}
                    faultTint={faultTint}
                  />
                ) : (
                  <TelemetryChart
                    series={data.series}
                    yMin={data.yMin}
                    yMax={data.yMax}
                    dimensions={dimensions}
                  />
                )}
                <ChartXAxis timeRangeLabel={data.timeRangeLabel} width={dimensions.plotWidth} />
              </View>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.breakdownLabel}>SIGNAL SUMMARY</Text>
      <ChartLegend series={data.series} muted={!live} />
    </CardShell>
  );
});

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: MonitoringLayout.cardMarginH,
    marginBottom: 0,
  },
  chartPanel: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    marginBottom: Spacing.md,
  },
  chartArea: {
    height: 220,
  },
  chartRow: {
    flex: 1,
    flexDirection: 'row',
  },
  plotColumn: {
    flex: 1,
  },
  breakdownLabel: {
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
