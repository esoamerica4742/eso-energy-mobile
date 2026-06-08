import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solarmanClient } from '@/services/solarman';
import type {
  SolarmanConnectOrgPayload,
  SolarmanConnectPayload,
  SolarmanLinkStationPayload,
} from '@/services/solarman.types';
import { ENODE_DEVICES_KEY } from '@/hooks/useEnodeDevices';
import { SOLARMAN_CONNECTION_KEY } from '@/hooks/useSolarmanConnection';

export function useSolarmanOnboarding() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SOLARMAN_CONNECTION_KEY }),
      queryClient.invalidateQueries({ queryKey: ENODE_DEVICES_KEY }),
      queryClient.invalidateQueries({ queryKey: ['enode', 'telemetry-latest'] }),
    ]);
  };

  const connect = useMutation({
    mutationFn: (payload: SolarmanConnectPayload) => solarmanClient.connect(payload),
    onSuccess: () => void invalidate(),
  });

  const connectOrg = useMutation({
    mutationFn: (payload: SolarmanConnectOrgPayload) => solarmanClient.connectOrg(payload),
    onSuccess: () => void invalidate(),
  });

  const listStations = useMutation({
    mutationFn: () => solarmanClient.listStations(),
  });

  const linkStation = useMutation({
    mutationFn: (payload: SolarmanLinkStationPayload) => solarmanClient.linkStation(payload),
    onSuccess: () => void invalidate(),
  });

  const sync = useMutation({
    mutationFn: () => solarmanClient.sync(),
    onSuccess: () => void invalidate(),
  });

  const disconnect = useMutation({
    mutationFn: () => solarmanClient.disconnect(),
    onSuccess: () => void invalidate(),
  });

  return {
    connect,
    connectOrg,
    listStations,
    linkStation,
    sync,
    disconnect,
  };
}
