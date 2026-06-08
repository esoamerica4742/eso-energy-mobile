export type ValueColor   = 'gold' | 'mint' | 'white' | 'muted';
export type NodeStatus   = 'active' | 'idle' | 'warning';
export type TierLevel    = 'SOVEREIGN FLEET TIER' | 'ENTERPRISE' | 'STANDARD';
export type DeltaDir     = 'up' | 'down';
export type ConnectionStatus = 'live' | 'offline' | 'stale' | 'fault';

export interface TopologyNode {
  id:          string;
  label:       string;
  labelFull:   string;
  iconName:    string;
  status:      NodeStatus;
  isCenter:    boolean;
  /** Demo / live overlay label (e.g. GENERATING) shown under the node tile. */
  flowLabel?:  string;
  /** Real-time kW readout in the orchestration flow grid. */
  powerKw?:    number;
}

export interface BatteryData {
  label:       string;
  soc:         number;
  statusLabel: string;
}

export interface SubMetric {
  label:       string;
  rawValue:    number;
  unit:        string;
  valueColor:  ValueColor;
  abbreviate:  boolean;
}

export interface KPISavingsData {
  sectionLabel:    string;
  description:     string;
  currency:        string;
  primaryValue:    number;
  delta:           number;
  deltaLabel:      string;
  deltaDirection:  DeltaDir;
  subMetrics:      SubMetric[];
}

export interface SiteData {
  name: string;
  tier: TierLevel;
}

export interface DashboardHealth {
  status: ConnectionStatus;
  message: string;
  updatedAt: string | null;
  showStaleBorder: boolean;
}

export interface DashboardData {
  site:                  SiteData;
  health:                DashboardHealth;
  orchestrationTitle:    string;
  orchestrationSubLabel: string;
  nodes:                 TopologyNode[];
  battery:               BatteryData;
  kpi:                   KPISavingsData;
}
