import { create } from "zustand";

export type RealtimeTelemetryState = {
  byDevice: Record<string, { solarKw: number; loadKw: number; batterySoc: number | null; updatedAt: string }>;
  lastSyncAt: string | null;
  wsConnected: boolean;
  reconnectCount: number;
  lastRealtimeLatencyMs: number | null;
  setConnected: (connected: boolean) => void;
  markReconnect: () => void;
  setRealtimeLatency: (latencyMs: number) => void;
  pushDevice: (deviceId: string, point: { solarKw: number; loadKw: number; batterySoc: number | null; updatedAt: string }) => void;
};

export const useRealtimeTelemetryStore = create<RealtimeTelemetryState>((set) => ({
  byDevice: {},
  lastSyncAt: null,
  wsConnected: false,
  reconnectCount: 0,
  lastRealtimeLatencyMs: null,
  setConnected: (connected) => set({ wsConnected: connected }),
  markReconnect: () => set((s) => ({ reconnectCount: s.reconnectCount + 1 })),
  setRealtimeLatency: (latencyMs) => set({ lastRealtimeLatencyMs: latencyMs }),
  pushDevice: (deviceId, point) =>
    set((s) => ({
      byDevice: { ...s.byDevice, [deviceId]: point },
      lastSyncAt: point.updatedAt,
    })),
}));

export const selectRealtimeDevice = (deviceId: string) => (s: RealtimeTelemetryState) =>
  s.byDevice[deviceId] ?? null;
