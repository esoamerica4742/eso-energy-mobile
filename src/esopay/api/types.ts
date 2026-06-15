/** Monnify wallet + bill payment types (mobile BFF contract). Amounts in kobo unless noted. */

export type MonnifyWalletStatus = 'active' | 'pending' | 'suspended';

export type EsoPayWallet = {
  company_id: string;
  balance_kobo: number;
  currency: 'NGN';
  monnify_wallet_reference: string;
  status: MonnifyWalletStatus;
  updated_at: string;
};

export type EsoPayReservedAccount = {
  account_number: string;
  account_name: string;
  bank_name: string;
  bank_code: string;
  /** Monnify reserved account reference — used for webhook reconciliation */
  monnify_account_reference: string;
  currency: 'NGN';
};

export type WalletTransactionType =
  | 'credit'
  | 'debit'
  | 'bill_payment'
  | 'refund'
  | 'reversal';

export type WalletTransactionStatus = 'pending' | 'success' | 'failed';

export type EsoPayWalletTransaction = {
  id: string;
  company_id: string;
  type: WalletTransactionType;
  amount_kobo: number;
  balance_after_kobo: number | null;
  status: WalletTransactionStatus;
  monnify_transaction_reference: string | null;
  monnify_payment_reference: string | null;
  narration: string | null;
  created_at: string;
};

export type BillStatus =
  | 'pending'
  | 'offset_calculated'
  | 'payment_initiated'
  | 'paid'
  | 'overdue'
  | 'void';

export type EsoPayBill = {
  id: string;
  company_id: string;
  site_id: string;
  utility_provider: string;
  account_number: string;
  billing_period_start: string;
  billing_period_end: string;
  gross_amount_kobo: number;
  offset_amount_kobo: number;
  net_amount_kobo: number;
  currency: 'NGN';
  status: BillStatus;
  due_date: string;
};

export type MonnifyBillPaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'reversed'
  | 'pending_fulfillment';

export type EsoPayBillPayment = {
  id: string;
  bill_id: string;
  company_id: string;
  amount_kobo: number;
  currency: 'NGN';
  status: MonnifyBillPaymentStatus;
  monnify_transaction_reference: string | null;
  monnify_payment_reference: string;
  wallet_transaction_id: string | null;
  failure_code: string | null;
  failure_message: string | null;
  initiated_by: string;
  created_at: string;
  completed_at: string | null;
};

export type EsoPayBillSummary = {
  totalOutstandingKobo: number;
  totalOffsetKobo: number;
  overdueCount: number;
  currentMonthBillCount: number;
  walletBalanceKobo: number;
};

export type UtilityProvider = {
  id: string;
  name: string;
  category: 'electricity' | 'airtime' | 'water' | 'tv' | 'data' | 'other';
  monnify_biller_code: string;
};

export type ValidateUtilityAccountRequest = {
  provider_id: string;
  account_number: string;
  amount_kobo?: number;
};

export type ValidateUtilityAccountResponse = {
  valid: boolean;
  customer_name: string | null;
  minimum_amount_kobo: number | null;
  maximum_amount_kobo: number | null;
};

export type PurchaseUtilityRequest = {
  provider_id: string;
  account_number: string;
  amount_kobo: number;
  idempotency_key: string;
  /** When paying a tracked bill row instead of ad-hoc purchase */
  bill_id?: string;
};

export type PurchaseUtilityResponse = {
  payment_reference: string;
  transaction_reference: string;
  status: MonnifyBillPaymentStatus;
  wallet_transaction_id: string | null;
  token_or_receipt: string | null;
  /** XXXX-XXXX-XXXX-XXXX-XXXX display form */
  token_formatted?: string | null;
  meter_name?: string | null;
  /** Shown when DisCo is temporarily down but wallet debit succeeded. */
  user_message?: string | null;
  code?: 'PENDING_FULFILLMENT' | string | null;
};

export type PayBillFromWalletRequest = {
  idempotency_key: string;
};

export type PayBillFromWalletResponse = {
  bill_payment: EsoPayBillPayment;
  wallet: EsoPayWallet;
};

export type CreateFundingIntentRequest = {
  amount_kobo: number;
  idempotency_key: string;
};

export type CreateFundingIntentResponse = {
  funding_intent_id: string;
  reserved_account: EsoPayReservedAccount;
  amount_kobo: number;
  expires_at: string;
};

export type BillListFilters = {
  status?: BillStatus | 'all';
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export type WalletTransactionCategory = 'all' | 'wallet' | 'bills' | 'airtime';

export type RecentUtilityPayment = {
  id: string;
  provider: UtilityProvider;
  account_number: string;
  amount_kobo: number;
  paid_at: string;
};

export type PowerShieldAlertLevel =
  | 'safe'
  | 'warn_10'
  | 'critical'
  | 'expired'
  | 'unknown';

export type PowerShieldAlertState =
  | 'safe'
  | 'warn_10'
  | 'critical'
  | 'expired'
  | 'unknown';

export type BurnConfidence = 'high' | 'medium' | 'low';

export type DailySpendSource = 'user' | 'learned' | 'estimated_single' | 'inferred_default';

export type PowerShieldMeter = {
  id: string;
  label: string;
  account_number: string;
  provider: UtilityProvider | null;
  daily_spend_kobo: number;
  user_daily_spend_kobo: number | null;
  learned_daily_spend_kobo: number | null;
  daily_spend_source?: DailySpendSource;
  burn_confidence?: BurnConfidence;
  needs_daily_spend_setup?: boolean;
  last_purchase_amount_kobo: number | null;
  last_purchase_at: string | null;
  last_token_or_receipt: string | null;
  estimated_depletion_at: string | null;
  capacity_remaining_pct?: number | null;
  volume_remaining_pct?: number | null;
  batch_total_kwh?: number | null;
  remaining_kwh?: number | null;
  shield_context_text?: string | null;
  hours_remaining: number | null;
  hours_remaining_low?: number | null;
  hours_remaining_high?: number | null;
  alert_level: PowerShieldAlertLevel;
  alert_state?: PowerShieldAlertState;
  auto_top_up_enabled?: boolean;
  auto_top_up_execute_at?: string | null;
  notify_warn_10?: boolean;
  notify_critical_5?: boolean;
  feedback_pending?: boolean;
};

export type PowerShieldFeedbackOutcome =
  | 'accurate'
  | 'too_early'
  | 'too_late'
  | 'no_blackout'
  | 'had_blackout';

export type PowerShieldFeedbackContext = 'post_payment' | 'alert_check';

export type PowerShieldFeedbackRequest = {
  meter_id?: string;
  context: PowerShieldFeedbackContext;
  outcome: PowerShieldFeedbackOutcome;
  predicted_depletion_at?: string | null;
  alert_level?: string | null;
  hours_remaining_at_feedback?: number | null;
};

export type PowerShieldFeedbackResponse = {
  feedback_id: string;
  accuracy: {
    sample_size: number;
    accurate_count: number;
    accuracy_rate: number | null;
  };
};

export type PowerShieldDashboard = {
  meters: PowerShieldMeter[];
  summary: {
    meter_count: number;
    worst_alert_level: PowerShieldAlertLevel;
    next_depletion_at: string | null;
    next_meter_label: string | null;
    hours_until_blackout: number | null;
    accuracy_sample_size?: number;
    accuracy_rate?: number | null;
    meters_needing_daily_spend?: number;
    alert_engine_version?: number;
    capacity_warn_threshold_pct?: number;
    capacity_critical_threshold_pct?: number;
    threshold_basis?: 'volume_pct' | 'capacity_pct';
  };
};

/** Inverter offset row from BFF — optional live telemetry merged in hooks. */
export type InverterOffset = {
  id: string;
  bill_id: string;
  company_id?: string;
  inverter_id: string;
  inverter_serial: string;
  generation_kwh: number;
  offset_kwh: number;
  tariff_rate_per_kwh?: number;
  offset_value_kobo?: number;
  offset_percentage: number;
  calculation_method?: string;
  data_source?: string;
  /** Merged from parent-app telemetry (not from API). */
  live_power_kw?: number | null;
  is_live?: boolean;
};

export type TransactionPinStatus = {
  configured: boolean;
  locked: boolean;
  locked_until: string | null;
  attempts_remaining: number;
};

export type VerifyTransactionPinResult = { ok: boolean } & TransactionPinStatus;

export type EsoPayKycStatus = {
  bvn_configured: boolean;
  nin_configured: boolean;
  bvn_last4: string | null;
  submitted_at: string | null;
};

export type EsoPayDisputeType = 'payment' | 'wallet' | 'other';
export type EsoPayDisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export type EsoPayDisputeTicket = {
  id: string;
  ticket_ref: string;
  dispute_type: EsoPayDisputeType;
  payment_reference: string | null;
  details: string;
  status: EsoPayDisputeStatus;
  created_at: string;
  updated_at: string;
};

export type CreateEsoPayDisputeRequest = {
  dispute_type: EsoPayDisputeType;
  payment_reference?: string | null;
  details: string;
};
