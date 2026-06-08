import type { InverterData } from '@/types/inverter';

/** Honest placeholder when no device or telemetry is connected — never demo numbers. */
export function createEmptyInverterData(siteName?: string | null): InverterData {
  return {
    id: 'awaiting',
    name: 'Awaiting device',
    site: siteName?.trim() || 'Fleet site',
    isLive: false,
    connectionStatus: 'offline',
    battery: { percentage: 0, status: 'normal' },
    load: { value: 0, unit: 'kW', label: 'Active draw', signalLevel: 0 },
    power: { value: 0, unit: 'kW', label: 'Output' },
    temp: { value: 0, unit: '°C', status: 'normal' },
  };
}
