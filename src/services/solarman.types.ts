export type SolarmanLinkStatus = 'pending' | 'linked' | 'error' | 'disconnected';

export type SolarmanOrg = {
  companyId: number;
  companyName: string;
  roleName?: string;
};

export type SolarmanConnection = {
  link_status: SolarmanLinkStatus;
  account_label: string | null;
  org_id: number | null;
  org_name: string | null;
  uid: number | null;
  linked_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  updated_at: string;
};

export type SolarmanConnectionResponse = {
  connection: SolarmanConnection | null;
  stationCount: number;
  linkedStationCount: number;
};

export type SolarmanConnectPayload = {
  email?: string;
  username?: string;
  mobile?: string;
  countryCode?: string;
  password: string;
};

export type SolarmanConnectResponse = {
  ok: boolean;
  requiresOrgSelection: boolean;
  orgs: SolarmanOrg[];
  accountLabel: string;
};

export type SolarmanConnectOrgPayload = SolarmanConnectPayload & {
  orgId: number;
};

export type SolarmanStation = {
  solarman_station_id: number;
  name: string;
  installed_capacity: number | null;
  location_address: string | null;
  network_status: string | null;
  battery_soc: number | null;
  site_id: string | null;
  linked_at: string | null;
};

export type SolarmanStationsResponse = {
  stations: SolarmanStation[];
  total: number;
};

export type SolarmanLinkStationPayload = {
  stationId: number;
  siteId: string;
};

export type SolarmanSyncResponse = {
  ok: boolean;
  stations: number;
  devices: number;
};

export type SolarmanApiErrorBody = {
  error?: string;
};
