/**
 * Eso Pay BFF routes — backed by Supabase `eso-pay-api` + Monnify (server-side only).
 * Mobile never calls Monnify directly; secrets stay on the edge/backend.
 */
export const ESO_PAY_ROUTES = {
  health: {
    monnify: '/health/monnify',
  },
  wallet: {
    root: '/wallet',
    transactions: '/wallet/transactions',
    reservedAccount: '/wallet/reserved-account',
    fundingIntents: '/wallet/funding-intents',
  },
  bills: {
    root: '/bills',
    summary: '/bills/summary',
    detail: (billId: string) => `/bills/${billId}`,
    offsets: (billId: string) => `/bills/${billId}/offsets`,
    pay: (billId: string) => `/bills/${billId}/pay`,
    payments: (billId: string) => `/bills/${billId}/payments`,
  },
  utilities: {
    providers: '/utilities/providers',
    validate: '/utilities/validate',
    purchase: '/utilities/purchase',
    purchaseStatus: '/utilities/purchase/status',
    recent: '/utilities/recent',
  },
  powerShield: {
    root: '/power-shield',
    sync: '/power-shield/sync',
    pushToken: '/power-shield/push-token',
    meter: (meterId: string) => `/power-shield/meters/${meterId}`,
    feedback: '/power-shield/feedback',
  },
} as const;
