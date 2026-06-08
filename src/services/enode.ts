/**
 * Enode API client — Stripe-style reliability: typed, retried, session-authenticated.
 * All traffic goes through the Supabase edge BFF; Enode secrets never touch the device.
 */
import Constants from 'expo-constants';
import { supabase, supabaseAnonKey, supabaseUrl } from '@/lib/supabase';
import { clearEnodeTokens, saveEnodeTokens } from '@/lib/secureVault';

type MobileExtra = {
  enodeApiUrl?: string;
  enodeRedirectUri?: string;
};

function getExtra(): MobileExtra {
  const raw = Constants.expoConfig?.extra;
  return raw && typeof raw === 'object' ? (raw as MobileExtra) : {};
}
import type {
  EnodeApiErrorBody,
  EnodeConnectionResponse,
  EnodeDeviceResponse,
  EnodeDevicesResponse,
  EnodeLinkSessionResponse,
  EnodeTelemetryResponse,
  EnodeTelemetryLatestResponse,
  EnodeSiteSummaryResponse,
  PushTokenRegisterRequest,
} from '@/services/enode.types';

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY_MS = 400;

export class EnodeApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'EnodeApiError';
    this.status = status;
  }
}

function getApiBase(): string {
  const extra = getExtra();
  const override =
    extra.enodeApiUrl ?? process.env.EXPO_PUBLIC_ENODE_API_URL;
  if (override) return override.replace(/\/$/, '');
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/enode-api`;
}

function getRedirectUri(): string {
  const extra = getExtra();
  return (
    extra.enodeRedirectUri ??
    process.env.EXPO_PUBLIC_ENODE_REDIRECT_URI ??
    'esoenergymobile://link-device/callback'
  );
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    await clearEnodeTokens();
    throw new EnodeApiError('Not signed in', 401);
  }
  await saveEnodeTokens({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token ?? null,
    expiresAt: data.session.expires_at ?? null,
  });
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

/**
 * Core request with exponential backoff (Stripe SDK pattern).
 */
async function request<T>(
  path: string,
  init: RequestInit = {},
  options?: { retries?: number },
): Promise<T> {
  const maxRetries = options?.retries ?? DEFAULT_MAX_RETRIES;
  const token = await getAccessToken();
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
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
        const body = await parseJson<EnodeApiErrorBody>(res);
        const message = body.error ?? `Request failed (${res.status})`;
        if (isRetryable(res.status) && attempt < maxRetries) {
          await sleep(BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        throw new EnodeApiError(message, res.status);
      }

      return parseJson<T>(res);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof EnodeApiError && !isRetryable(err.status)) {
        throw err;
      }
      if (attempt < maxRetries) {
        await sleep(BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
    }
  }

  throw lastError ?? new EnodeApiError('Request failed', 500);
}

export const enodeClient = {
  getRedirectUri,

  createLinkSession(vendorType?: 'inverter' | 'charger' | 'battery') {
    return request<EnodeLinkSessionResponse>('/link-session', {
      method: 'POST',
      body: JSON.stringify({
        redirectUri: getRedirectUri(),
        vendorType: vendorType ?? 'inverter',
      }),
    });
  },

  listDevices(sync = false) {
    const q = sync ? '?sync=true' : '';
    return request<EnodeDevicesResponse>(`/devices${q}`);
  },

  getDevice(deviceId: string, refresh = false) {
    const q = refresh ? '?refresh=true' : '';
    return request<EnodeDeviceResponse>(`/devices/${deviceId}${q}`);
  },

  syncAll() {
    return request<{ synced: number }>('/sync', { method: 'POST' });
  },

  syncDevice(deviceId: string) {
    return request<{ ok: boolean }>(`/devices/${deviceId}/sync`, {
      method: 'POST',
    });
  },

  getTelemetry(deviceId: string, hours = 24) {
    return request<EnodeTelemetryResponse>(
      `/telemetry/${deviceId}?hours=${hours}`,
    );
  },

  getTelemetryLatest(siteId?: string) {
    const q = siteId ? `?siteId=${encodeURIComponent(siteId)}` : '';
    return request<EnodeTelemetryLatestResponse>(`/telemetry/latest${q}`);
  },

  getSiteSummary(siteId: string) {
    return request<EnodeSiteSummaryResponse>(
      `/telemetry/site-summary?siteId=${encodeURIComponent(siteId)}`,
    );
  },

  getConnection() {
    return request<EnodeConnectionResponse>('/connection');
  },

  registerPushToken(payload: PushTokenRegisterRequest) {
    return request<{ ok: boolean }>('/notifications/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export function isEnodeConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);
}
