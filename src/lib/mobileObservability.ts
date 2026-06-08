type Metric = {
  name: string;
  value: number;
  tags?: Record<string, string | number | boolean | null>;
};

function logMetric(metric: Metric): void {
  const payload = {
    ts: new Date().toISOString(),
    subsystem: "mobile-observability",
    ...metric,
  };
  // Keep lightweight and dependency-free; wire to Sentry/Otel transport if present.
  console.log(JSON.stringify(payload));
}

export function recordMetric(name: string, value: number, tags?: Metric["tags"]): void {
  logMetric({ name, value, tags });
}

export function recordRealtimeReconnect(count: number): void {
  recordMetric("realtime_reconnect_count", count);
}

export function recordRealtimeLatency(ms: number): void {
  recordMetric("realtime_latency_ms", ms);
}

export function startFrameDropMonitor(sampleSeconds = 20): () => void {
  let raf = 0;
  let running = true;
  let last = performance.now();
  let drops = 0;
  const threshold = 1000 / 45; // frame slower than 45fps threshold
  const started = Date.now();

  const tick = (now: number) => {
    if (!running) return;
    const dt = now - last;
    if (dt > threshold) drops += 1;
    last = now;
    if (Date.now() - started >= sampleSeconds * 1000) {
      recordMetric("frame_drop_events", drops, { window_seconds: sampleSeconds });
      running = false;
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => {
    running = false;
    cancelAnimationFrame(raf);
  };
}
