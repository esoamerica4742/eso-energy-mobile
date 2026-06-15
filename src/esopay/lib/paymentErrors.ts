import { EsoPayApiError, toEsoPayApiError } from '@/esopay/api/client';

export function isInsufficientWalletError(error: unknown): boolean {
  const apiError = toEsoPayApiError(error);
  if (apiError.code === 'INSUFFICIENT_WALLET_BALANCE') return true;
  if (apiError.status === 402) return true;
  return /insufficient|low balance|not enough/i.test(apiError.message);
}

export function isTransactionPinError(error: unknown): boolean {
  const apiError = toEsoPayApiError(error);
  return (
    apiError.code === 'TRANSACTION_PIN_REQUIRED' ||
    apiError.code === 'TRANSACTION_PIN_NOT_CONFIGURED' ||
    apiError.code === 'TRANSACTION_PIN_INVALID' ||
    apiError.code === 'TRANSACTION_PIN_LOCKED'
  );
}

export function getPaymentErrorMessage(error: unknown): string {
  const apiError = toEsoPayApiError(error);
  if (isInsufficientWalletError(error)) {
    return 'Wallet balance is too low. Add funds to your wallet, then try again.';
  }
  if (apiError.code === 'TRANSACTION_PIN_NOT_CONFIGURED') {
    return 'Set your transaction PIN before paying. Open Settings or Home to set it up.';
  }
  if (apiError.code === 'TRANSACTION_PIN_INVALID') {
    return 'Incorrect transaction PIN. Try again.';
  }
  if (apiError.code === 'TRANSACTION_PIN_LOCKED') {
    return 'Too many incorrect PIN attempts. Try again later.';
  }
  if (apiError.code === 'TRANSACTION_PIN_REQUIRED') {
    return 'Enter your transaction PIN to complete this payment.';
  }
  if (apiError.code === 'CURRENT_PIN_REQUIRED') {
    return 'Enter your current transaction PIN to change it.';
  }
  if (apiError.code === 'CURRENT_PIN_INVALID') {
    return 'Current transaction PIN is incorrect.';
  }
  return apiError.message;
}

export { EsoPayApiError };
