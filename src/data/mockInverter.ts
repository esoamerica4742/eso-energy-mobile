import type { InverterData } from '@/types/inverter';

export const mockInverter: InverterData = {
  id:     'inverter-a-lagos',
  name:   'Main Inverter A',
  site:   'Lagos Plant',
  isLive: true,
  battery: {
    percentage: 0,
    status:     'critical',
  },
  load: {
    value:       405.5,
    unit:        'kW',
    label:       'Active draw',
    signalLevel: 4,
  },
  power: {
    value: 312.70,
    unit:  'kW',
    label: 'Output',
  },
  temp: {
    value:  0,
    unit:   '°C',
    status: 'normal',
  },
};
