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
    return 'Enter the same PIN you use to unlock Eso Energy, then try again.';
  }
  if (apiError.code === 'TRANSACTION_PIN_INVALID') {
    return 'Incorrect PIN. Use the same PIN you unlock the app with.';
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
  if (
    apiError.code === 'UNKNOWN_PROVIDER' ||
    /unknown provider/i.test(apiError.message)
  ) {
    return 'This biller is no longer available. Pull to refresh providers, then try again.';
  }
  return apiError.message;
}

export { EsoPayApiError };
