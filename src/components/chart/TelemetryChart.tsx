import { Fragment, memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Line } from 'react-native-svg';
import { ChartColors, ChartMetrics, Colors, Radius } from '@/tokens/design';
import { ChartEndDot } from '@/components/chart/ChartEndDot';
import { dataToPath, getLastPoint } from '@/utils/chartUtils';
import type { ChartDimensions, ChartSeries } from '@/types/telemetry';

type Props = {
  series: ChartSeries[];
  yMin: number;
  yMax: number;
  dimensions: ChartDimensions;
};

export const TelemetryChart = memo(function TelemetryChart({ series, yMin, yMax, dimensions }: Props) {
  const paths = useMemo(
    () =>
      series.map((item) => ({
        id: item.id,
        linePath: dataToPath(item.data, dimensions, yMin, yMax),
        fillPath: dataToPath(item.data, dimensions, yMin, yMax, true),
        endDot: getLastPoint(item.data, dimensions, yMin, yMax),
        color: item.color,
      })),
    [dimensions, series, yMax, yMin],
  );

  return (
    <View style={[styles.wrap, { width: dimensions.plotWidth, height: dimensions.plotHeight }]}>
      <Svg width={dimensions.plotWidth} height={dimensions.plotHeight}>
        <Defs>
          {series.map((item) => (
            <LinearGradient key={item.id} id={`fill-${item.id}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={item.color} stopOpacity={0.12} />
              <Stop offset="100%" stopColor={item.color} stopOpacity={0} />
            </LinearGradient>
          ))}
        </Defs>

        {[0.25, 0.5, 0.75, 1].map((pct, index) => (
          <Line
            key={index}
            x1={0}
            y1={dimensions.plotHeight * pct}
            x2={dimensions.plotWidth}
            y2={dimensions.plotHeight * pct}
            stroke={ChartColors.gridLine}
            strokeWidth={1}
            strokeDasharray="3 6"
          />
        ))}

        {paths.map((path) => (
          <Fragment key={path.id}>
            <Path d={path.fillPath} fill={`url(#fill-${path.id})`} />
            <Path
              d={path.linePath}
              stroke={path.color}
              strokeWidth={ChartMetrics.lineGlowWidth}
              strokeOpacity={0.18}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d={path.linePath}
              stroke={path.color}
              strokeWidth={ChartMetrics.lineWidth}
              strokeOpacity={1}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Fragment>
        ))}
      </Svg>

      {paths.map((path) => (
        <ChartEndDot key={path.id} x={path.endDot.x} y={path.endDot.y} color={path.color} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    position: 'relative',
    overflow: 'hidden',
  },
});
