import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  buildEsoPayIdempotencyKey,
  EsoPayApiError,
  toEsoPayApiError,
} from '@/esopay/api/client';
import {
  esoPayBillListPrefix,
  esoPayKeys,
} from '@/esopay/api/queryKeys';
import {
  parseCreateFundingIntentResponse,
  parseEsoPayBill,
  parseEsoPayBillPayments,
  parseEsoPayBillSummary,
  parseEsoPayReservedAccount,
  parseEsoPayWallet,
  parseInverterOffsets,
  parsePaginatedBills,
  parsePaginatedWalletTransactions,
  parsePayBillFromWalletResponse,
  parsePurchaseUtilityResponse,
  parseRecentUtilityPayments,
  parseUtilityProviders,
  parseValidateUtilityAccountResponse,
} from '@/esopay/api/schemas';
import type {
  BillListFilters,
  CreateFundingIntentRequest,
  EsoPayBill,
  EsoPayBillPayment,
  EsoPayBillSummary,
  EsoPayReservedAccount,
  EsoPayWallet,
  InverterOffset,
  PaginatedResponse,
  PayBillFromWalletResponse,
  PurchaseUtilityRequest,
  PurchaseUtilityResponse,
  RecentUtilityPayment,
  ValidateUtilityAccountRequest,
  WalletTransactionCategory,
} from '@/esopay/api/types';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { useEnodeTelemetryLatest } from '@/hooks/useEnodeTelemetryLatest';
import { CacheTier, defaultQueryOptions } from '@/lib/cachePolicy';
import type { EnodeTelemetryLatestPoint } from '@/services/enode.types';

export type BillFilters = BillListFilters;

const WALLET_STALE_MS = 30_000;

export function mergeOffsetTelemetry(
  offsets: InverterOffset[],
  telemetryPoints: EnodeTelemetryLatestPoint[] | undefined,
  activeInverterIds: string[],
): InverterOffset[] {
  const latestByDevice = new Map(
    (telemetryPoints ?? []).map((point) => [point.device_id, point.solar_output_kw]),
  );

  return offsets.map((offset) => {
    const livePower = latestByDevice.get(offset.inverter_id) ?? null;
    const isActive = activeInverterIds.includes(offset.inverter_id);
    return {
      ...offset,
      live_power_kw: livePower,
      is_live: isActive && livePower != null && livePower > 0,
    };
  });
}

function sortPaymentsNewestFirst(payments: EsoPayBillPayment[]): EsoPayBillPayment[] {
  return [...payments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function isInsufficientWalletError(error: unknown): boolean {
  const apiError = toEsoPayApiError(error);
  if (apiError.code === 'INSUFFICIENT_WALLET_BALANCE') return true;
  if (apiError.status === 402) return true;
  return /insufficient|low balance|not enough/i.test(apiError.message);
}

export function getPaymentErrorMessage(error: unknown): string {
  if (isInsufficientWalletError(error)) {
    return 'Wallet balance is too low. Add funds to your wallet, then try again.';
  }
  return toEsoPayApiError(error).message;
}

export function useBillsList(filters?: BillFilters) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled();

  return useQuery({
    queryKey: esoPayKeys.billsList(host.companyId, filters),
    queryFn: async () => parsePaginatedBills(await api.bills.list(filters)),
    enabled,
    staleTime: CacheTier.dashboard.staleTime,
    gcTime: CacheTier.dashboard.gcTime,
    refetchOnWindowFocus: true,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useBillDetail(billId: string) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled(Boolean(billId));

  return useQuery({
    queryKey: esoPayKeys.billDetail(host.companyId, billId),
    queryFn: async () => parseEsoPayBill(await api.bills.get(billId)),
    enabled,
    staleTime: CacheTier.dashboard.staleTime,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

type OffsetsQuery = Omit<UseQueryResult<InverterOffset[]>, 'data'> & {
  data: InverterOffset[] | undefined;
};

export function useInverterOffsets(billId: string): OffsetsQuery {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled(Boolean(billId));
  const latestTelemetry = useEnodeTelemetryLatest();

  const query = useQuery({
    queryKey: esoPayKeys.offsets(host.companyId, billId),
    queryFn: async () => {
      const response = await api.bills.getOffsets(billId);
      return parseInverterOffsets(response);
    },
    enabled,
    staleTime: CacheTier.dashboard.staleTime,
    placeholderData: defaultQueryOptions.placeholderData,
  });

  const data = useMemo(
    () =>
      query.data
        ? mergeOffsetTelemetry(
            query.data,
            latestTelemetry.data,
            host.activeInverterIds,
          )
        : undefined,
    [query.data, latestTelemetry.data, host.activeInverterIds],
  );

  return { ...query, data };
}

export function useBillSummaryStats() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled();

  return useQuery({
    queryKey: esoPayKeys.summary(host.companyId),
    queryFn: async () => parseEsoPayBillSummary(await api.bills.summary()),
    enabled,
    staleTime: CacheTier.dashboard.staleTime,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useWallet(options?: { pollIntervalMs?: number; retry?: boolean }) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled();
  const pollIntervalMs = options?.pollIntervalMs;

  return useQuery({
    queryKey: esoPayKeys.wallet(host.companyId),
    queryFn: async () => parseEsoPayWallet(await api.wallet.get()),
    enabled,
    staleTime: pollIntervalMs ? 0 : WALLET_STALE_MS,
    gcTime: CacheTier.dashboard.gcTime,
    refetchInterval: enabled && pollIntervalMs ? pollIntervalMs : false,
    retry: options?.retry ?? 1,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useWalletTransactions(options?: {
  page?: number;
  limit?: number;
  category?: WalletTransactionCategory;
}) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const category = options?.category ?? 'all';
  const enabled = useEsoPayEnabled();

  return useQuery({
    queryKey: esoPayKeys.walletTransactions(host.companyId, page, limit, category),
    queryFn: async () =>
      parsePaginatedWalletTransactions(
        await api.wallet.getTransactions({ page, limit, category }),
      ),
    enabled,
    staleTime: WALLET_STALE_MS,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useRecentUtilityPayments(options?: { limit?: number }) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const limit = options?.limit ?? 8;
  const enabled = useEsoPayEnabled();

  return useQuery<RecentUtilityPayment[]>({
    queryKey: esoPayKeys.recentUtilityPayments(host.companyId, limit),
    queryFn: async () => parseRecentUtilityPayments(await api.utilities.getRecent({ limit })),
    enabled,
    staleTime: WALLET_STALE_MS,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useReservedAccount(options?: { ensureIfMissing?: boolean }) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const ensureIfMissing = options?.ensureIfMissing ?? false;
  const enabled = useEsoPayEnabled();

  return useQuery({
    queryKey: esoPayKeys.reservedAccount(host.companyId),
    queryFn: async () => {
      if (ensureIfMissing) {
        return parseEsoPayReservedAccount(await api.wallet.ensureReservedAccount());
      }
      try {
        return parseEsoPayReservedAccount(await api.wallet.getReservedAccount());
      } catch (error) {
        const apiError = toEsoPayApiError(error);
        if (
          apiError.status === 404 ||
          apiError.code === 'NOT_FOUND' ||
          apiError.code === 'RESERVED_ACCOUNT_UNAVAILABLE'
        ) {
          return parseEsoPayReservedAccount(await api.wallet.ensureReservedAccount());
        }
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60_000,
    gcTime: CacheTier.structural.gcTime,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useEnsureReservedAccount() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      parseEsoPayReservedAccount(await api.wallet.ensureReservedAccount()),
    onSuccess: (account: EsoPayReservedAccount) => {
      queryClient.setQueryData(esoPayKeys.reservedAccount(host.companyId), account);
    },
  });
}

export function useCreateFundingIntent() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CreateFundingIntentRequest, 'idempotency_key'>) => {
      const idempotency_key = buildEsoPayIdempotencyKey([
        host.companyId,
        host.userId,
        String(input.amount_kobo),
        String(Date.now()),
      ]);
      return parseCreateFundingIntentResponse(
        await api.wallet.createFundingIntent({ ...input, idempotency_key }),
      );
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        esoPayKeys.reservedAccount(host.companyId),
        response.reserved_account,
      );
    },
  });
}

type PayBillVariables = {
  billId: string;
};

type PayBillContext = {
  previousBill?: EsoPayBill;
};

export function usePayBillFromWallet() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    PayBillFromWalletResponse,
    EsoPayApiError,
    PayBillVariables,
    PayBillContext
  >({
    mutationFn: async ({ billId }) => {
      const idempotency_key = buildEsoPayIdempotencyKey([
        billId,
        host.userId,
        String(Date.now()),
      ]);
      return parsePayBillFromWalletResponse(
        await api.bills.payFromWallet(billId, { idempotency_key }),
      );
    },
    onMutate: async ({ billId }) => {
      const detailKey = esoPayKeys.billDetail(host.companyId, billId);
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousBill = queryClient.getQueryData<EsoPayBill>(detailKey);
      if (previousBill) {
        queryClient.setQueryData<EsoPayBill>(detailKey, {
          ...previousBill,
          status: 'payment_initiated',
        });
      }

      return { previousBill };
    },
    onSuccess: (response, { billId }) => {
      const detailKey = esoPayKeys.billDetail(host.companyId, billId);

      queryClient.setQueryData<EsoPayBill>(detailKey, (current) =>
        current
          ? {
              ...current,
              status:
                response.bill_payment.status === 'success' ? 'paid' : current.status,
            }
          : current,
      );

      queryClient.setQueryData<EsoPayWallet>(
        esoPayKeys.wallet(host.companyId),
        response.wallet,
      );

      queryClient.setQueryData<EsoPayBillPayment[]>(
        esoPayKeys.payments(host.companyId, billId),
        (current) => {
          const next = [response.bill_payment, ...(current ?? [])];
          return sortPaymentsNewestFirst(next);
        },
      );

      queryClient.setQueryData<EsoPayBillSummary>(
        esoPayKeys.summary(host.companyId),
        (current) =>
          current
            ? {
                ...current,
                walletBalanceKobo: response.wallet.balance_kobo,
                totalOutstandingKobo:
                  response.bill_payment.status === 'success'
                    ? Math.max(0, current.totalOutstandingKobo - response.bill_payment.amount_kobo)
                    : current.totalOutstandingKobo,
              }
            : current,
      );

      queryClient.invalidateQueries({
        queryKey: esoPayBillListPrefix(host.companyId),
      });
    },
    onError: (_error, { billId }, context) => {
      if (context?.previousBill) {
        queryClient.setQueryData(
          esoPayKeys.billDetail(host.companyId, billId),
          context.previousBill,
        );
      }
    },
  });
}

export function usePaymentHistory(billId: string) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled(Boolean(billId));

  return useQuery({
    queryKey: esoPayKeys.payments(host.companyId, billId),
    queryFn: async () => {
      const payments = parseEsoPayBillPayments(await api.bills.getPayments(billId));
      return sortPaymentsNewestFirst(payments);
    },
    enabled,
    staleTime: CacheTier.dashboard.staleTime,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useUtilityProviders() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const enabled = useEsoPayEnabled();

  return useQuery({
    queryKey: esoPayKeys.utilityProviders(host.companyId),
    queryFn: async () => parseUtilityProviders(await api.utilities.listProviders()),
    enabled,
    staleTime: CacheTier.structural.staleTime,
    retry: 2,
    refetchOnWindowFocus: defaultQueryOptions.refetchOnWindowFocus,
    placeholderData: defaultQueryOptions.placeholderData,
  });
}

export function useValidateUtilityAccount() {
  const api = useEsoPayApiClient();

  return useMutation({
    mutationFn: async (body: ValidateUtilityAccountRequest) =>
      parseValidateUtilityAccountResponse(await api.utilities.validateAccount(body)),
  });
}

type PurchaseUtilityVariables = Omit<PurchaseUtilityRequest, 'idempotency_key'> & {
  transaction_pin: string;
};

export function usePurchaseUtility() {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    PurchaseUtilityResponse,
    EsoPayApiError,
    PurchaseUtilityVariables
  >({
    mutationFn: async (body) => {
      const idempotency_key = buildEsoPayIdempotencyKey([
        body.provider_id,
        body.account_number,
        String(body.amount_kobo),
        host.userId,
        String(Date.now()),
      ]);
      return parsePurchaseUtilityResponse(
        await api.utilities.purchase({ ...body, idempotency_key }),
      );
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: esoPayKeys.wallet(host.companyId) });
      queryClient.invalidateQueries({
        queryKey: [...esoPayKeys.all, 'wallet-transactions', host.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: [...esoPayKeys.all, 'recent-utility-payments', host.companyId],
      });
      queryClient.invalidateQueries({ queryKey: esoPayKeys.powerShield(host.companyId) });
      queryClient.invalidateQueries({ queryKey: esoPayBillListPrefix(host.companyId) });
      queryClient.invalidateQueries({ queryKey: esoPayKeys.summary(host.companyId) });
    },
  });
}

/** True when wallet balance covers a bill's net amount. */
export function useCanPayBillFromWallet(bill: EsoPayBill | undefined): {
  canPay: boolean;
  shortfallKobo: number;
} {
  const walletQuery = useWallet();

  return useMemo(() => {
    if (!bill || !walletQuery.data) {
      return { canPay: false, shortfallKobo: bill?.net_amount_kobo ?? 0 };
    }

    const shortfallKobo = Math.max(0, bill.net_amount_kobo - walletQuery.data.balance_kobo);
    return {
      canPay: walletQuery.data.balance_kobo >= bill.net_amount_kobo,
      shortfallKobo,
    };
  }, [bill, walletQuery.data]);
}

/** Poll wallet balance — pass `pollIntervalMs` on fund-wallet screen after bank transfer. */
export function useWalletPoller(intervalMs = 10_000) {
  return useWallet({ pollIntervalMs: intervalMs });
}

const TERMINAL_UTILITY_STATUSES = new Set(['success', 'failed', 'reversed']);

const POLLABLE_UTILITY_STATUSES = new Set([
  'pending',
  'processing',
  'pending_fulfillment',
]);

export type UtilityPaymentPollStatus = PurchaseUtilityResponse['status'];

/** Poll wallet transactions until a utility purchase reaches a terminal status. */
export function useUtilityPaymentPoll(
  paymentReference: string | null,
  initialStatus: UtilityPaymentPollStatus | null,
  enabled = true,
) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const shouldPoll =
    enabled &&
    Boolean(paymentReference) &&
    Boolean(initialStatus) &&
    POLLABLE_UTILITY_STATUSES.has(initialStatus ?? '');

  return useQuery({
    queryKey: esoPayKeys.utilityPaymentStatus(host.companyId, paymentReference ?? ''),
    queryFn: async (): Promise<PurchaseUtilityResponse> => {
      if (!paymentReference) {
        return {
          payment_reference: '',
          transaction_reference: '',
          status: initialStatus ?? 'pending',
          wallet_transaction_id: null,
          token_or_receipt: null,
        };
      }

      try {
        return parsePurchaseUtilityResponse(
          await api.utilities.getPurchaseStatus(paymentReference),
        );
      } catch {
        const response = parsePaginatedWalletTransactions(
          await api.wallet.getTransactions({ page: 1, limit: 50 }),
        );
        const match = response.data.find(
          (tx) => tx.monnify_payment_reference === paymentReference,
        );
        const status: UtilityPaymentPollStatus = !match
          ? (initialStatus ?? 'processing')
          : match.status === 'success'
            ? 'success'
            : match.status === 'failed'
              ? 'failed'
              : 'processing';
        return {
          payment_reference: paymentReference,
          transaction_reference: paymentReference,
          status,
          wallet_transaction_id: null,
          token_or_receipt: null,
        };
      }
    },
    enabled: shouldPoll,
    refetchInterval: shouldPoll ? 3_000 : false,
    staleTime: 0,
  });
}

export type {
  EsoPayBill,
  EsoPayBillPayment,
  EsoPayBillSummary,
  EsoPayReservedAccount,
  EsoPayWallet,
  InverterOffset,
  PaginatedResponse,
};
