import Constants from 'expo-constants';
import { supabase, supabaseAnonKey, supabaseUrl } from '@/lib/supabase';
import type {
  SolarmanApiErrorBody,
  SolarmanConnectOrgPayload,
  SolarmanConnectPayload,
  SolarmanConnectResponse,
  SolarmanConnectionResponse,
  SolarmanLinkStationPayload,
  SolarmanStationsResponse,
  SolarmanSyncResponse,
} from '@/services/solarman.types';

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY_MS = 400;

export class SolarmanApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SolarmanApiError';
    this.status = status;
  }
}

function getApiBase(): string {
  const extra = Constants.expoConfig?.extra as { solarmanApiUrl?: string } | undefined;
  const override = extra?.solarmanApiUrl ?? process.env.EXPO_PUBLIC_SOLARMAN_API_URL;
  if (override) return override.replace(/\/$/, '');
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/solarman-api`;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new SolarmanApiError('Not signed in', 401);
  }
  return data.session.access_token;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options?: { retries?: number },
): Promise<T> {
  const maxRetries = options?.retries ?? DEFAULT_MAX_RETRIES;
  const token = await getAccessToken();
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        ...(init.headers as Record<string, string> | undefined),
      },
    });

    if (!res.ok) {
      const body = await parseJson<SolarmanApiErrorBody>(res);
      const message = body.error ?? `Request failed (${res.status})`;
      if (isRetryable(res.status) && attempt < maxRetries) {
        await sleep(BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      throw new SolarmanApiError(message, res.status);
    }

    return parseJson<T>(res);
  }

  throw new SolarmanApiError('Request failed', 500);
}

export const solarmanClient = {
  getConnection() {
    return request<SolarmanConnectionResponse>('/connection');
  },

  connect(payload: SolarmanConnectPayload) {
    return request<SolarmanConnectResponse>('/connect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  connectOrg(payload: SolarmanConnectOrgPayload) {
    return request<{ ok: boolean; orgId: number; orgName: string | null }>('/connect/org', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listStations() {
    return request<SolarmanStationsResponse>('/stations');
  },

  linkStation(payload: SolarmanLinkStationPayload) {
    return request<SolarmanSyncResponse>('/stations/link', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  sync() {
    return request<SolarmanSyncResponse>('/sync', { method: 'POST' });
  },

  disconnect() {
    return request<{ ok: boolean }>('/disconnect', { method: 'POST' });
  },
};
