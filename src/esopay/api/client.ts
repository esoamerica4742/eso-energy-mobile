/**
 * Eso Pay API client — Axios singleton targeting the Eso Pay BFF (Monnify wallet + bills).
 * Monnify credentials never touch the device; all Monnify calls are server-side.
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { supabaseUrl } from '@/lib/supabase';
import type { EsoPayHostCredentials } from '@/esopay/context/types';
import { ESO_PAY_ROUTES } from '@/esopay/api/endpoints';
import type {
  BillListFilters,
  CreateFundingIntentRequest,
  CreateFundingIntentResponse,
  EsoPayBill,
  EsoPayBillPayment,
  EsoPayBillSummary,
  EsoPayReservedAccount,
  EsoPayWallet,
  EsoPayWalletTransaction,
  PaginatedResponse,
  PayBillFromWalletRequest,
  PayBillFromWalletResponse,
  PurchaseUtilityRequest,
  PurchaseUtilityResponse,
  PowerShieldDashboard,
  PowerShieldFeedbackRequest,
  PowerShieldFeedbackResponse,
  PowerShieldMeter,
  RecentUtilityPayment,
  UtilityProvider,
  ValidateUtilityAccountRequest,
  ValidateUtilityAccountResponse,
  WalletTransactionCategory,
  InverterOffset,
} from '@/esopay/api/types';

const REQUEST_TIMEOUT_MS = 15_000;

type MobileExtra = {
  esoPayApiUrl?: string;
};

type RetryableConfig = InternalAxiosRequestConfig & {
  _esoPayRetried?: boolean;
};

const emptyCredentials: EsoPayHostCredentials = {
  authToken: '',
  companyId: '',
  refreshAuthToken: async () => {
    throw new Error('Eso Pay API credentials are not bound');
  },
  ensureAuthSession: async () => {
    throw new Error('Eso Pay API credentials are not bound');
  },
  onSessionExpired: () => {},
};

let credentialRef: EsoPayHostCredentials = emptyCredentials;

export function getEsoPayApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra;
  const fromExtra =
    extra && typeof extra === 'object' ? (extra as MobileExtra).esoPayApiUrl : undefined;

  const override =
    fromExtra ??
    process.env.ESO_PAY_API_BASE_URL ??
    process.env.EXPO_PUBLIC_ESO_PAY_API_URL;

  if (override) return override.replace(/\/$/, '');

  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/eso-pay-api`;
}

export function bindEsoPayApiCredentials(credentials: EsoPayHostCredentials): void {
  const prev = credentialRef;
  credentialRef = {
    ...credentials,
    // Host React state can lag behind secure-store recovery — never wipe a good JWT.
    authToken: credentials.authToken || prev.authToken,
    companyId: credentials.companyId || prev.companyId,
  };
}

/** Keep Axios credentials in sync after off-thread session recovery. */
export function patchEsoPayApiAuthToken(authToken: string): void {
  if (!authToken) return;
  credentialRef = { ...credentialRef, authToken };
}

export function getEsoPayApiCredentials(): EsoPayHostCredentials {
  return credentialRef;
}

/** Idempotency for wallet debits / bill payments (spec §3 — Monnify). */
export function buildEsoPayIdempotencyKey(parts: string[]): string {
  return parts.filter(Boolean).join('-');
}

function createEsoPayHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getEsoPayApiBaseUrl(),
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(async (config) => {
    let { authToken, companyId, ensureAuthSession } = credentialRef;

    if (!authToken && ensureAuthSession) {
      try {
        authToken = await ensureAuthSession();
        patchEsoPayApiAuthToken(authToken);
      } catch (error) {
        return Promise.reject(toEsoPayApiError(error));
      }
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    } else {
      delete config.headers.Authorization;
    }

    if (companyId) {
      config.headers['X-Eso-Pay-User-Id'] = companyId;
      config.headers['X-Company-Id'] = companyId;
    } else {
      delete config.headers['X-Eso-Pay-User-Id'];
      delete config.headers['X-Company-Id'];
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableConfig | undefined;
      if (!config || error.response?.status !== 401 || config._esoPayRetried) {
        return Promise.reject(toEsoPayApiError(error));
      }

      config._esoPayRetried = true;

      try {
        const refresh =
          credentialRef.ensureAuthSession ?? credentialRef.refreshAuthToken;
        const newToken = await refresh();
        patchEsoPayApiAuthToken(newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
        return client.request(config);
      } catch (refreshError) {
        return Promise.reject(toEsoPayApiError(refreshError));
      }
    },
  );

  return client;
}

/** Low-level singleton — prefer `esoPayApi` typed methods in feature code. */
export const esopayApiClient = createEsoPayHttpClient();

function withIdempotency(idempotencyKey: string) {
  return { headers: { 'Idempotency-Key': idempotencyKey } };
}

/**
 * Typed Eso Pay BFF — Monnify wallet, reserved accounts, and utility bill endpoints.
 * All routes are user-scoped via JWT + `X-Eso-Pay-User-Id`.
 */
export const esoPayApi = {
  health: {
    monnify: () =>
      esopayApiClient.get<{ ok: boolean; code?: string; message?: string }>(
        ESO_PAY_ROUTES.health.monnify,
      ).then((r) => r.data),
  },
  wallet: {
    get: () =>
      esopayApiClient.get<EsoPayWallet>(ESO_PAY_ROUTES.wallet.root).then((r) => r.data),

    getTransactions: (params?: {
      page?: number;
      limit?: number;
      category?: WalletTransactionCategory;
    }) =>
      esopayApiClient
        .get<PaginatedResponse<EsoPayWalletTransaction>>(ESO_PAY_ROUTES.wallet.transactions, {
          params,
        })
        .then((r) => r.data),

    getReservedAccount: () =>
      esopayApiClient
        .get<EsoPayReservedAccount>(ESO_PAY_ROUTES.wallet.reservedAccount)
        .then((r) => r.data),

    /** Ensures a Monnify reserved virtual account exists for bank-transfer wallet funding. */
    ensureReservedAccount: () =>
      esopayApiClient
        .post<EsoPayReservedAccount>(ESO_PAY_ROUTES.wallet.reservedAccount)
        .then((r) => r.data),

    createFundingIntent: (body: CreateFundingIntentRequest) =>
      esopayApiClient
        .post<CreateFundingIntentResponse>(ESO_PAY_ROUTES.wallet.fundingIntents, body, {
          ...withIdempotency(body.idempotency_key),
        })
        .then((r) => r.data),
  },

  bills: {
    list: (filters?: BillListFilters) =>
      esopayApiClient
        .get<PaginatedResponse<EsoPayBill>>(ESO_PAY_ROUTES.bills.root, { params: filters })
        .then((r) => r.data),

    summary: () =>
      esopayApiClient.get<EsoPayBillSummary>(ESO_PAY_ROUTES.bills.summary).then((r) => r.data),

    get: (billId: string) =>
      esopayApiClient.get<EsoPayBill>(ESO_PAY_ROUTES.bills.detail(billId)).then((r) => r.data),

    getOffsets: (billId: string) =>
      esopayApiClient
        .get<{ offsets: InverterOffset[] }>(ESO_PAY_ROUTES.bills.offsets(billId))
        .then((r) => r.data),

    getPayments: (billId: string) =>
      esopayApiClient
        .get<EsoPayBillPayment[]>(ESO_PAY_ROUTES.bills.payments(billId))
        .then((r) => r.data),

    /** Debit your Monnify wallet and settle a utility bill via backend Monnify bill pay. */
    payFromWallet: (billId: string, body: PayBillFromWalletRequest) =>
      esopayApiClient
        .post<PayBillFromWalletResponse>(ESO_PAY_ROUTES.bills.pay(billId), body, {
          ...withIdempotency(body.idempotency_key),
        })
        .then((r) => r.data),
  },

  utilities: {
    listProviders: () =>
      esopayApiClient
        .get<UtilityProvider[]>(ESO_PAY_ROUTES.utilities.providers)
        .then((r) => r.data),

    validateAccount: (body: ValidateUtilityAccountRequest) =>
      esopayApiClient
        .post<ValidateUtilityAccountResponse>(ESO_PAY_ROUTES.utilities.validate, body)
        .then((r) => r.data),

    /** Ad-hoc utility purchase (Disco prepaid/postpaid) debited from your wallet. */
    purchase: (body: PurchaseUtilityRequest) =>
      esopayApiClient
        .post<PurchaseUtilityResponse>(ESO_PAY_ROUTES.utilities.purchase, body, {
          ...withIdempotency(body.idempotency_key),
        })
        .then((r) => r.data),

    getRecent: (params?: { limit?: number }) =>
      esopayApiClient
        .get<{ data: RecentUtilityPayment[] }>(ESO_PAY_ROUTES.utilities.recent, { params })
        .then((r) => r.data),

    getPurchaseStatus: (paymentReference: string) =>
      esopayApiClient
        .get<PurchaseUtilityResponse>(ESO_PAY_ROUTES.utilities.purchaseStatus, {
          params: { payment_reference: paymentReference },
        })
        .then((r) => r.data),
  },

  powerShield: {
    getDashboard: () =>
      esopayApiClient.get<PowerShieldDashboard>(ESO_PAY_ROUTES.powerShield.root).then((r) => r.data),

    sync: () =>
      esopayApiClient.post<PowerShieldDashboard>(ESO_PAY_ROUTES.powerShield.sync).then((r) => r.data),

    updateMeter: (
      meterId: string,
      body: {
        label?: string;
        daily_spend_kobo?: number | null;
        auto_top_up_enabled?: boolean;
        notify_warn_10?: boolean;
        notify_critical_5?: boolean;
      },
    ) =>
      esopayApiClient
        .patch<PowerShieldMeter>(ESO_PAY_ROUTES.powerShield.meter(meterId), body)
        .then((r) => r.data),

    registerPushToken: (body: {
      expo_push_token: string;
      platform: string;
      app_version?: string;
      power_shield_enabled?: boolean;
    }) =>
      esopayApiClient.post<{ ok: boolean; id: string }>(ESO_PAY_ROUTES.powerShield.pushToken, body).then(
        (r) => r.data,
      ),

    submitFeedback: (body: PowerShieldFeedbackRequest) =>
      esopayApiClient
        .post<PowerShieldFeedbackResponse>(ESO_PAY_ROUTES.powerShield.feedback, body)
        .then((r) => r.data),
  },
};

export class EsoPayApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'EsoPayApiError';
    this.status = status;
    this.code = code;
  }
}

export function toEsoPayApiError(error: unknown): EsoPayApiError {
  if (error instanceof EsoPayApiError) return error;
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { error?: string; message?: string; code?: string; responseMessage?: string }
      | undefined;
    const message =
      body?.error ??
      body?.message ??
      body?.responseMessage ??
      error.message ??
      'Eso Pay request failed';
    return new EsoPayApiError(message, error.response?.status ?? 0, body?.code);
  }
  if (error instanceof Error) {
    if (/auth session missing/i.test(error.message)) {
      return new EsoPayApiError(
        'Your Eso Pay session expired. Sign out and sign in again with your email code.',
        401,
        'AUTH_SESSION_MISSING',
      );
    }
    return new EsoPayApiError(error.message, 0);
  }
  return new EsoPayApiError('Eso Pay request failed', 0);
}
