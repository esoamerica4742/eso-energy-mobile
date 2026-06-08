import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useRealtimeTelemetryStore } from "@/stores/realtimeTelemetryStore";
import type { EnodeDevice } from "@/services/enode.types";
import { ENODE_DEVICES_KEY } from "@/hooks/useEnodeDevices";
import { recordRealtimeLatency, recordRealtimeReconnect } from "@/lib/mobileObservability";

type UseRealtimeTelemetryOptions = {
  tenantId?: string;
  enabled?: boolean;
};

type TelemetryLatestRow = {
  device_id: string;
  tenant_id: string;
  solar_output_kw: number;
  load_draw_kw: number;
  battery_soc_percent: number | null;
  updated_at: string;
};

export function useRealtimeTelemetry({ tenantId, enabled = true }: UseRealtimeTelemetryOptions) {
  const queryClient = useQueryClient();
  const setConnected = useRealtimeTelemetryStore((s) => s.setConnected);
  const pushDevice = useRealtimeTelemetryStore((s) => s.pushDevice);
  const markReconnect = useRealtimeTelemetryStore((s) => s.markReconnect);
  const setRealtimeLatency = useRealtimeTelemetryStore((s) => s.setRealtimeLatency);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const active = enabled && supabaseConfigured && Boolean(tenantId);

  const channelName = useMemo(
    () => `telemetry-latest:${tenantId ?? "none"}`,
    [tenantId],
  );

  useEffect(() => {
    if (!active || !tenantId) return;

    const subscribe = () => {
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "telemetry_latest_state",
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            const row = payload.new as TelemetryLatestRow | null;
            if (!row) return;
            pushDevice(row.device_id, {
              solarKw: Number(row.solar_output_kw ?? 0),
              loadKw: Number(row.load_draw_kw ?? 0),
              batterySoc: row.battery_soc_percent == null ? null : Number(row.battery_soc_percent),
              updatedAt: row.updated_at,
            });
            const latency = Math.max(0, Date.now() - new Date(row.updated_at).getTime());
            setRealtimeLatency(latency);
            recordRealtimeLatency(latency);

            queryClient.setQueryData<EnodeDevice[]>(ENODE_DEVICES_KEY, (prev) => {
              if (!prev) return prev;
              let changed = false;
              const next = prev.map((d) => {
                if (d.id !== row.device_id) return d;
                changed = true;
                return {
                  ...d,
                  production_rate_kw: Number(row.solar_output_kw ?? d.production_rate_kw ?? 0),
                  grid_power_kw: Number(row.load_draw_kw ?? d.grid_power_kw ?? 0),
                  battery_level_pct: row.battery_soc_percent == null ? d.battery_level_pct : Number(row.battery_soc_percent),
                  updated_at: row.updated_at,
                };
              });
              return changed ? next : prev;
            });
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            retryCountRef.current = 0;
            setConnected(true);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnected(false);
            const backoffBase = Math.min(30_000, Math.pow(2, retryCountRef.current) * 1_000);
            const jitter = Math.floor(Math.random() * 350);
            const delay = backoffBase + jitter;
            retryCountRef.current += 1;
            markReconnect();
            recordRealtimeReconnect(retryCountRef.current);
            if (retryRef.current) clearTimeout(retryRef.current);
            retryRef.current = setTimeout(() => {
              void supabase.removeChannel(channel);
              subscribe();
            }, delay);
          }
        });

      return channel;
    };

    const channel = subscribe();

    return () => {
      setConnected(false);
      if (retryRef.current) clearTimeout(retryRef.current);
      void supabase.removeChannel(channel);
    };
  }, [active, channelName, markReconnect, pushDevice, queryClient, setConnected, setRealtimeLatency, tenantId]);
}
