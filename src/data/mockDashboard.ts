import type { DashboardData } from '@/types/dashboard';

export const mockDashboard: DashboardData = {
  site: {
    name: 'Lagos Plant',
    tier: 'SOVEREIGN FLEET TIER',
  },
  health: {
    status: 'live',
    message: 'Live telemetry',
    updatedAt: new Date().toISOString(),
    showStaleBorder: false,
  },
  orchestrationTitle:    'Energy Orchestration Layer',
  orchestrationSubLabel: 'SOVEREIGN TRANSFER TOPOLOGY',
  nodes: [
    {
      id:        'solar',
      label:     'Solar Capture',
      labelFull: 'Solar Capture Feed',
      iconName:  'sunny-outline',
      status:    'active',
      isCenter:  false,
    },
    {
      id:        'inverter',
      label:     'ESO Inverter',
      labelFull: 'ESO Inverter Intelligence',
      iconName:  'git-network-outline',
      status:    'active',
      isCenter:  true,
    },
    {
      id:        'facility',
      label:     'Facility Grid',
      labelFull: 'Facility Grid Load',
      iconName:  'business-outline',
      status:    'idle',
      isCenter:  false,
    },
  ],
  battery: {
    label:       'Metallic Lithium Reserve',
    soc:         4,
    statusLabel: 'Standby',
  },
  kpi: {
    sectionLabel:   'NET DAILY SAVINGS · SOLAR VS DIESEL',
    description:    'Aggregate fuel + grid offset across selected branch · 24h rolling',
    currency:       '₦',
    primaryValue:   47802449,
    delta:          100.0,
    deltaLabel:     'VS 7-DAY AVG',
    deltaDirection: 'up',
    subMetrics: [
      {
        label:      'MTD',
        rawValue:   1300230000,
        unit:       '₦',
        valueColor: 'white',
        abbreviate: true,
      },
      {
        label:      'DIESEL AVOIDED',
        rawValue:   349,
        unit:       'L',
        valueColor: 'gold',
        abbreviate: false,
      },
      {
        label:      'SOLAR SHARE',
        rawValue:   74,
        unit:       '%',
        valueColor: 'mint',
        abbreviate: false,
      },
    ],
  },
};
