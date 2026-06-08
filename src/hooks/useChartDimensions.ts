import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type { ChartDimensions } from '@/types/telemetry';
import { ChartMetrics } from '@/tokens/design';

export function useChartDimensions() {
  const [dimensions, setDimensions] = useState<ChartDimensions | null>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({
      width,
      height,
      plotWidth: width - ChartMetrics.yAxisWidth,
      plotHeight: height - ChartMetrics.xAxisHeight,
    });
  }, []);

  return { dimensions, onLayout };
}
