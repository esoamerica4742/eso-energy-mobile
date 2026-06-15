import type { BillListFilters } from '@/esopay/api/types';

/** TanStack Query keys — partition by wallet scope (authenticated user id). */
export const esoPayKeys = {
  all: ['esopay'] as const,

  wallet: (companyId: string) => [...esoPayKeys.all, 'wallet', companyId] as const,

  walletTransactions: (companyId: string, page = 1, limit = 20, category: string = 'all') =>
    [...esoPayKeys.all, 'wallet-transactions', companyId, page, limit, category] as const,

  recentUtilityPayments: (companyId: string, limit = 8) =>
    [...esoPayKeys.all, 'recent-utility-payments', companyId, limit] as const,

  powerShield: (companyId: string) => [...esoPayKeys.all, 'power-shield', companyId] as const,

  reservedAccount: (companyId: string) =>
    [...esoPayKeys.all, 'reserved-account', companyId] as const,

  billsList: (companyId: string, filters?: BillListFilters) =>
    [...esoPayKeys.all, 'bills', companyId, filters ?? {}] as const,

  billDetail: (companyId: string, billId: string) =>
    [...esoPayKeys.all, 'bill', companyId, billId] as const,

  offsets: (companyId: string, billId: string) =>
    [...esoPayKeys.all, 'offsets', companyId, billId] as const,

  summary: (companyId: string) => [...esoPayKeys.all, 'summary', companyId] as const,

  payments: (companyId: string, billId: string) =>
    [...esoPayKeys.all, 'payments', companyId, billId] as const,

  utilityProviders: (companyId: string) =>
    [...esoPayKeys.all, 'utility-providers', companyId] as const,

  utilityPaymentStatus: (companyId: string, paymentReference: string) =>
    [...esoPayKeys.all, 'utility-payment-status', companyId, paymentReference] as const,

  kyc: (companyId: string) => [...esoPayKeys.all, 'kyc', companyId] as const,
};

export function esoPayBillListPrefix(companyId: string) {
  return [...esoPayKeys.all, 'bills', companyId] as const;
}
