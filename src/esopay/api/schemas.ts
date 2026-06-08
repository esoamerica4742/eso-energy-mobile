import { z } from 'zod';
import { EsoPayApiError } from '@/esopay/api/client';

const billStatusSchema = z.enum([
  'pending',
  'offset_calculated',
  'payment_initiated',
  'paid',
  'overdue',
  'void',
]);

const walletStatusSchema = z.enum(['active', 'pending', 'suspended']);

const walletTransactionTypeSchema = z.enum([
  'credit',
  'debit',
  'bill_payment',
  'refund',
  'reversal',
]);

const walletTransactionStatusSchema = z.enum(['pending', 'success', 'failed']);

const billPaymentStatusSchema = z.enum([
  'pending',
  'processing',
  'success',
  'failed',
  'reversed',
]);

export const esoPayWalletSchema = z.object({
  company_id: z.string(),
  balance_kobo: z.number(),
  currency: z.literal('NGN'),
  monnify_wallet_reference: z.string(),
  status: walletStatusSchema,
  updated_at: z.string(),
});

export const esoPayReservedAccountSchema = z.object({
  account_number: z.string(),
  account_name: z.string(),
  bank_name: z.string(),
  bank_code: z.string(),
  monnify_account_reference: z.string(),
  currency: z.literal('NGN'),
});

export const esoPayBillSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  site_id: z.string(),
  utility_provider: z.string(),
  account_number: z.string(),
  billing_period_start: z.string(),
  billing_period_end: z.string(),
  gross_amount_kobo: z.number(),
  offset_amount_kobo: z.number(),
  net_amount_kobo: z.number(),
  currency: z.literal('NGN'),
  status: billStatusSchema,
  due_date: z.string(),
});

export const esoPayBillPaymentSchema = z.object({
  id: z.string(),
  bill_id: z.string(),
  company_id: z.string(),
  amount_kobo: z.number(),
  currency: z.literal('NGN'),
  status: billPaymentStatusSchema,
  monnify_transaction_reference: z.string().nullable(),
  monnify_payment_reference: z.string(),
  wallet_transaction_id: z.string().nullable(),
  failure_code: z.string().nullable(),
  failure_message: z.string().nullable(),
  initiated_by: z.string(),
  created_at: z.string(),
  completed_at: z.string().nullable(),
});

export const esoPayBillSummarySchema = z.object({
  totalOutstandingKobo: z.number(),
  totalOffsetKobo: z.number(),
  overdueCount: z.number(),
  currentMonthBillCount: z.number(),
  walletBalanceKobo: z.number(),
});

export const esoPayWalletTransactionSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  type: walletTransactionTypeSchema,
  amount_kobo: z.number(),
  balance_after_kobo: z.number().nullable(),
  status: walletTransactionStatusSchema,
  monnify_transaction_reference: z.string().nullable(),
  monnify_payment_reference: z.string().nullable(),
  narration: z.string().nullable(),
  created_at: z.string(),
});

export const inverterOffsetSchema = z.object({
  id: z.string(),
  bill_id: z.string(),
  company_id: z.string().optional(),
  inverter_id: z.string(),
  inverter_serial: z.string(),
  generation_kwh: z.number(),
  offset_kwh: z.number(),
  tariff_rate_per_kwh: z.number().optional(),
  offset_value_kobo: z.number().optional(),
  offset_percentage: z.number(),
  calculation_method: z.string().optional(),
  data_source: z.string().optional(),
});

export const utilityProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  // API may return categories with different casing (e.g. "AIRTIME" vs "airtime").
  // Normalize to lowercase before enum validation.
  category: z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase() : v),
    z.enum(['electricity', 'airtime', 'water', 'tv', 'data', 'other']),
  ),
  monnify_biller_code: z.string(),
});

export const paginatedBillsSchema = z.object({
  data: z.array(esoPayBillSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export const paginatedWalletTransactionsSchema = z.object({
  data: z.array(esoPayWalletTransactionSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export const offsetsResponseSchema = z.object({
  offsets: z.array(inverterOffsetSchema),
});

export const validateUtilityAccountResponseSchema = z.object({
  valid: z.boolean(),
  customer_name: z.string().nullable(),
  minimum_amount_kobo: z.number().nullable(),
  maximum_amount_kobo: z.number().nullable(),
});

export const payBillFromWalletResponseSchema = z.object({
  bill_payment: esoPayBillPaymentSchema,
  wallet: esoPayWalletSchema,
});

export const purchaseUtilityResponseSchema = z.object({
  payment_reference: z.string(),
  transaction_reference: z.string(),
  status: z.enum([
    'pending',
    'processing',
    'success',
    'failed',
    'reversed',
    'pending_fulfillment',
  ]),
  wallet_transaction_id: z.string().nullable(),
  token_or_receipt: z.string().nullable(),
  token_formatted: z.string().nullable().optional(),
  meter_name: z.string().nullable().optional(),
  user_message: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
});

export const recentUtilityPaymentSchema = z.object({
  id: z.string(),
  provider: utilityProviderSchema,
  account_number: z.string(),
  amount_kobo: z.number(),
  paid_at: z.string(),
});

export const recentUtilityPaymentsResponseSchema = z.object({
  data: z.array(recentUtilityPaymentSchema),
});

export const createFundingIntentResponseSchema = z.object({
  funding_intent_id: z.string(),
  reserved_account: esoPayReservedAccountSchema,
  amount_kobo: z.number(),
  expires_at: z.string(),
});

function parseWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  console.warn(`[EsoPay] ${label} validation failed`, result.error.flatten());
  throw new EsoPayApiError(`${label} response invalid`, 0, 'VALIDATION_ERROR');
}

export const parseEsoPayWallet = (data: unknown) =>
  parseWithSchema(esoPayWalletSchema, data, 'wallet');

export const parseEsoPayReservedAccount = (data: unknown) =>
  parseWithSchema(esoPayReservedAccountSchema, data, 'reserved account');

export const parseEsoPayBill = (data: unknown) =>
  parseWithSchema(esoPayBillSchema, data, 'bill');

export const parseEsoPayBillSummary = (data: unknown) =>
  parseWithSchema(esoPayBillSummarySchema, data, 'bill summary');

export const parsePaginatedBills = (data: unknown) =>
  parseWithSchema(paginatedBillsSchema, data, 'bills list');

export const parsePaginatedWalletTransactions = (data: unknown) =>
  parseWithSchema(paginatedWalletTransactionsSchema, data, 'wallet transactions');

export const parseInverterOffsets = (data: unknown) =>
  parseWithSchema(offsetsResponseSchema, data, 'inverter offsets').offsets;

export const parseEsoPayBillPayments = (data: unknown) => {
  const result = z.array(esoPayBillPaymentSchema).safeParse(data);
  if (result.success) return result.data;
  console.warn('[EsoPay] bill payments validation failed', result.error.flatten());
  throw new EsoPayApiError('bill payments response invalid', 0, 'VALIDATION_ERROR');
};

export const parseUtilityProviders = (data: unknown) => {
  if (data == null) return [];
  const result = z.array(utilityProviderSchema).safeParse(data);
  if (result.success) return result.data;
  console.warn('[EsoPay] utility providers validation failed', result.error.flatten());
  throw new EsoPayApiError('utility providers response invalid', 0, 'VALIDATION_ERROR');
};

export const parseValidateUtilityAccountResponse = (data: unknown) =>
  parseWithSchema(validateUtilityAccountResponseSchema, data, 'utility validation');

export const parsePayBillFromWalletResponse = (data: unknown) =>
  parseWithSchema(payBillFromWalletResponseSchema, data, 'pay bill from wallet');

export const parsePurchaseUtilityResponse = (data: unknown) =>
  parseWithSchema(purchaseUtilityResponseSchema, data, 'utility purchase');

export const parseCreateFundingIntentResponse = (data: unknown) =>
  parseWithSchema(createFundingIntentResponseSchema, data, 'funding intent');

const powerShieldAlertLevelSchema = z.enum([
  'safe',
  'warn_10',
  'critical',
  'expired',
  'unknown',
]);

export const powerShieldMeterSchema = z.object({
  id: z.string(),
  label: z.string(),
  account_number: z.string(),
  provider: utilityProviderSchema.nullable(),
  daily_spend_kobo: z.number(),
  user_daily_spend_kobo: z.number().nullable(),
  learned_daily_spend_kobo: z.number().nullable(),
  last_purchase_amount_kobo: z.number().nullable(),
  last_purchase_at: z.string().nullable(),
  last_token_or_receipt: z.string().nullable(),
  estimated_depletion_at: z.string().nullable(),
  capacity_remaining_pct: z.number().nullable().optional(),
  daily_spend_source: z
    .enum(['user', 'learned', 'estimated_single', 'inferred_default'])
    .optional(),
  burn_confidence: z.enum(['high', 'medium', 'low']).optional(),
  needs_daily_spend_setup: z.boolean().optional(),
  hours_remaining: z.number().nullable(),
  alert_level: powerShieldAlertLevelSchema,
  alert_state: powerShieldAlertLevelSchema.optional(),
  auto_top_up_enabled: z.boolean().optional(),
  auto_top_up_execute_at: z.string().nullable().optional(),
  notify_warn_10: z.boolean().optional(),
  notify_critical_5: z.boolean().optional(),
  feedback_pending: z.boolean().optional(),
});

export const powerShieldDashboardSchema = z.object({
  meters: z.array(powerShieldMeterSchema),
  summary: z.object({
    meter_count: z.number(),
    worst_alert_level: powerShieldAlertLevelSchema,
    next_depletion_at: z.string().nullable(),
    next_meter_label: z.string().nullable(),
    hours_until_blackout: z.number().nullable(),
    accuracy_sample_size: z.number().optional(),
    accuracy_rate: z.number().nullable().optional(),
    meters_needing_daily_spend: z.number().optional(),
    alert_engine_version: z.number().optional(),
    capacity_warn_threshold_pct: z.number().optional(),
    capacity_critical_threshold_pct: z.number().optional(),
  }),
});

export const powerShieldFeedbackResponseSchema = z.object({
  feedback_id: z.string(),
  accuracy: z.object({
    sample_size: z.number(),
    accurate_count: z.number(),
    accuracy_rate: z.number().nullable(),
  }),
});

export const parseRecentUtilityPayments = (data: unknown) =>
  parseWithSchema(recentUtilityPaymentsResponseSchema, data, 'recent utility payments')
    .data as import('@/esopay/api/types').RecentUtilityPayment[];

export const parsePowerShieldDashboard = (data: unknown) =>
  parseWithSchema(powerShieldDashboardSchema, data, 'power shield dashboard');

export const parsePowerShieldMeter = (data: unknown) =>
  parseWithSchema(powerShieldMeterSchema, data, 'power shield meter');

export const parsePowerShieldFeedbackResponse = (data: unknown) =>
  parseWithSchema(powerShieldFeedbackResponseSchema, data, 'power shield feedback');
