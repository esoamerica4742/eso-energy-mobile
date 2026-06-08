export {
  INTERPOLATION_MIN_MS,
  INTERPOLATION_MAX_MS,
  applyMicroVariation,
  computeInterpolationDuration,
  interpolateScalars,
  scalarsEqual,
  scalarsToTelemetry,
  telemetryToScalars,
  type ScalarMetrics,
} from './telemetryInterpolation';

export { generateOperationalInsights, type OperationalInsight, type InsightLevel } from './operationalInsights';

export { generateFleetOperationalInsights } from './fleetOperationalInsights';

export { appendSparklinePoint, seedSparklineFromMetric } from './sparklineStream';
