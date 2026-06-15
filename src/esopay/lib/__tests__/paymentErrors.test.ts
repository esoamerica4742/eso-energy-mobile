import {
  EsoPayApiError,
  getPaymentErrorMessage,
  isInsufficientWalletError,
} from '@/esopay/lib/paymentErrors';

describe('payment error helpers', () => {
  it('detects insufficient wallet balance', () => {
    expect(
      isInsufficientWalletError(
        new EsoPayApiError('INSUFFICIENT_WALLET_BALANCE', 402, 'INSUFFICIENT_WALLET_BALANCE'),
      ),
    ).toBe(true);
    expect(isInsufficientWalletError(new EsoPayApiError('low balance', 400))).toBe(true);
    expect(isInsufficientWalletError(new EsoPayApiError('network', 500))).toBe(false);
  });

  it('returns friendly copy for low balance', () => {
    const msg = getPaymentErrorMessage(
      new EsoPayApiError('INSUFFICIENT_WALLET_BALANCE', 402, 'INSUFFICIENT_WALLET_BALANCE'),
    );
    expect(msg).toMatch(/Add funds/i);
  });

  it('passes through other API messages', () => {
    expect(getPaymentErrorMessage(new EsoPayApiError('Meter not found', 404))).toBe(
      'Meter not found',
    );
  });
});
