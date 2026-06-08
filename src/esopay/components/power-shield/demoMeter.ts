import type { PowerShieldMeter } from '@/esopay/api/types';

/** Dev-only preview meter for post-activation UI toggle. */
export const DEMO_POWER_SHIELD_METER: PowerShieldMeter = {
  id: 'demo-meter',
  label: 'Home meter',
  account_number: '45001234567',
  provider: {
    id: 'ikeja-electric',
    name: 'Ikeja Electric',
    category: 'electricity',
    monnify_biller_code: 'IKEJA',
  },
  daily_spend_kobo: 74_000,
  user_daily_spend_kobo: null,
  learned_daily_spend_kobo: 74_000,
  last_purchase_amount_kobo: 5_000_00,
  last_purchase_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  last_token_or_receipt: null,
  estimated_depletion_at: new Date(Date.now() + 3.2 * 24 * 60 * 60 * 1000).toISOString(),
  capacity_remaining_pct: 9,
  hours_remaining: 18,
  alert_level: 'warn_10',
  alert_state: 'warn_10',
  auto_top_up_enabled: true,
  notify_warn_10: true,
  notify_critical_5: true,
};
