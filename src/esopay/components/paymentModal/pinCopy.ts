import type { PaymentPinMode } from '@/esopay/components/paymentModal/types';

export function getPaymentPinTitle(mode: PaymentPinMode): string {
  if (mode === 'create') return 'Create transaction PIN';
  if (mode === 'confirm') return 'Confirm transaction PIN';
  return 'Enter transaction PIN';
}

export function getPaymentPinSubtitle(
  mode: PaymentPinMode,
  amountLabel: string,
  providerName: string,
): string {
  if (mode === 'create') {
    return 'Secure wallet debits with your 4-digit PIN.';
  }
  if (mode === 'confirm') {
    return 'Re-enter your PIN to confirm.';
  }
  return `Authorize ${amountLabel} for ${providerName}.`;
}
