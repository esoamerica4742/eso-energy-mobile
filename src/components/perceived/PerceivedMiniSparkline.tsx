import { memo } from 'react';
import { MiniSparkline } from '@/components/fleet/command/MiniSparkline';
import { usePerceivedSparkline } from '@/hooks/usePerceivedSparkline';

type Props = {
  metricValue: number;
  seed: number[];
  streaming: boolean;
  smooth?: boolean;
  status: 'live' | 'degraded' | 'offline';
  width?: number;
  height?: number;
};

/** Sparkline tail with micro-fluctuations between backend syncs. */
export const PerceivedMiniSparkline = memo(function PerceivedMiniSparkline({
  metricValue,
  seed,
  streaming,
  smooth = true,
  status,
  width = 88,
  height = 34,
}: Props) {
  const values = usePerceivedSparkline(metricValue, streaming, smooth, seed);
  return <MiniSparkline values={values} status={status} width={width} height={height} />;
});
