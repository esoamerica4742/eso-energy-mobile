import type { PowerShieldMeter } from '@/esopay/api/types';



/** Signature for remote-push registration refresh (server sends capacity alerts). */

export function meterNotificationSignature(meters: PowerShieldMeter[]): string {

  return meters

    .map(

      (m) =>

        `${m.id}:${m.last_purchase_at ?? ''}:${m.capacity_remaining_pct ?? ''}:${m.alert_level}:${m.auto_top_up_enabled ?? false}:${m.notify_warn_10 ?? true}:${m.notify_critical_5 ?? true}`,

    )

    .join('|');

}



export function smartDailySpendOptionsKobo(meter: PowerShieldMeter): number[] {

  const values = new Set<number>([20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000]);



  if (meter.learned_daily_spend_kobo && meter.learned_daily_spend_kobo > 0) {

    values.add(roundSpendChip(meter.learned_daily_spend_kobo));

  }

  if (meter.daily_spend_kobo > 0) {

    values.add(roundSpendChip(meter.daily_spend_kobo));

  }

  if (meter.last_purchase_amount_kobo && meter.last_purchase_amount_kobo > 0) {

    values.add(roundSpendChip(meter.last_purchase_amount_kobo / 21));

    values.add(roundSpendChip(meter.last_purchase_amount_kobo / 14));

    values.add(roundSpendChip(meter.last_purchase_amount_kobo / 30));

  }



  return [...values].filter((v) => v >= 3_000).sort((a, b) => a - b).slice(0, 7);

}



function roundSpendChip(kobo: number): number {

  const n = Math.max(3_000, Math.round(kobo));

  if (n < 10_000) return Math.round(n / 500) * 500;

  if (n < 100_000) return Math.round(n / 1_000) * 1_000;

  return Math.round(n / 5_000) * 5_000;

}


