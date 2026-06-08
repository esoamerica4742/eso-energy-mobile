/**
 * In-memory telemetry cache — receives realtime updates from Supabase
 * and maintains a rolling window of the last N points per device.
 *
 * Architecture:
 *   Supabase realtime → useTelemetry hook → telemetryStore
 *   Components subscribe to individual device slices, so only the
 *   affected card/chart re-renders on each update.
 */
import { create } from 'zustand';

export interface TelemetryPoint {
  id: string;
  device_id: string;
  voltage: number;
  current: number;
  power_kw: number;
  battery_pct: number;
  load_kw: number;
  temperature_c: number;
  timestamp: string;
}

/** Per-device ring buffer */
type DeviceHistory = TelemetryPoint[];

interface TelemetryState {
  /** Latest single reading per device */
  latest: Record<string, TelemetryPoint>;
  /** Rolling history (last MAX_POINTS points) per device */
  history: Record<string, DeviceHistory>;
  /** Subscription-is-active flag per site */
  subscribed: Record<string, boolean>;

  /** Called by the realtime hook on each incoming row */
  push: (point: TelemetryPoint) => void;
  /** Seed initial data from an RPC or REST query */
  seed: (points: TelemetryPoint[]) => void;
  markSubscribed: (siteId: string, active: boolean) => void;
  clearSite: (siteId: string) => void;
}

const MAX_POINTS = 120; // 15 min window at ~7.5s cadence

export const useTelemetryStore = create<TelemetryState>((set) => ({
  latest: {},
  history: {},
  subscribed: {},

  push: (point) =>
    set((s) => {
      const prevLatest = s.latest[point.device_id];
      const prevHistory = s.history[point.device_id] ?? [];
      const prevTail = prevHistory[prevHistory.length - 1];
      if (
        prevLatest?.id === point.id &&
        prevLatest?.timestamp === point.timestamp &&
        prevTail?.id === point.id &&
        prevTail?.timestamp === point.timestamp
      ) {
        return s;
      }

      const next = prevHistory.length >= MAX_POINTS ? prevHistory.slice(1) : prevHistory;
      return {
        latest: { ...s.latest, [point.device_id]: point },
        history: { ...s.history, [point.device_id]: [...next, point] },
      };
    }),

  seed: (points) =>
    set((s) => {
      const latestPatch: Record<string, TelemetryPoint> = { ...s.latest };
      const historyPatch: Record<string, DeviceHistory> = { ...s.history };
      let changed = false;

      for (const p of points) {
        const prevLatest = latestPatch[p.device_id];
        const prevHistory = historyPatch[p.device_id] ?? [];
        const prevTail = prevHistory[prevHistory.length - 1];
        const isDuplicate =
          prevLatest?.id === p.id &&
          prevLatest?.timestamp === p.timestamp &&
          prevTail?.id === p.id &&
          prevTail?.timestamp === p.timestamp;

        if (isDuplicate) continue;

        changed = true;
        latestPatch[p.device_id] = p;
        historyPatch[p.device_id] = [...prevHistory, p].slice(-MAX_POINTS);
      }

      if (!changed) return s;
      return { latest: latestPatch, history: historyPatch };
    }),

  markSubscribed: (siteId, active) =>
    set((s) => ({ subscribed: { ...s.subscribed, [siteId]: active } })),

  clearSite: (siteId) =>
    set((s) => ({
      subscribed: { ...s.subscribed, [siteId]: false },
    })),
}));

/** Stable empty reference — never return `[]` inline from a selector (infinite re-render loop). */
const EMPTY_HISTORY: DeviceHistory = [];

/** Selector: latest reading for a single device */
export const selectLatest = (deviceId: string) => (s: TelemetryState) =>
  s.latest[deviceId] ?? null;

/** Selector: chart history for a single device */
export const selectHistory = (deviceId: string) => (s: TelemetryState) =>
  s.history[deviceId] ?? EMPTY_HISTORY;
