import { EsoPayApiError } from '@/esopay/lib/paymentErrors';
import {
  getMonnifyProvisionErrorMessage,
  getMonnifyProvisionLoadingHint,
} from '@/esopay/lib/monnifyProvisionErrors';

describe('getMonnifyProvisionErrorMessage', () => {
  it('maps auth session errors', () => {
    const msg = getMonnifyProvisionErrorMessage(
      new EsoPayApiError('unauthorized', 401, 'AUTH_SESSION_MISSING'),
    );
    expect(msg).toMatch(/session expired/i);
    expect(msg).not.toMatch(/supabase/i);
  });

  it('maps Monnify not configured without infra jargon in production', () => {
    const originalDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const msg = getMonnifyProvisionErrorMessage(
      new EsoPayApiError('missing', 503, 'MONNIFY_NOT_CONFIGURED'),
    );
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    expect(msg).toMatch(/temporarily unavailable/i);
    expect(msg).toMatch(/support@esoenergy.com/i);
    expect(msg).not.toMatch(/MONNIFY_ENV/);
  });

  it('falls back to message', () => {
    expect(
      getMonnifyProvisionErrorMessage(new EsoPayApiError('Custom failure', 500, 'UNKNOWN')),
    ).toBe('Custom failure');
  });

  it('sanitizes infra-heavy fallback messages', () => {
    const originalDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const msg = getMonnifyProvisionErrorMessage(
      new EsoPayApiError('Add MONNIFY_API_KEY to Supabase secrets', 500, 'UNKNOWN'),
    );
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    expect(msg).toMatch(/wallet setup failed/i);
    expect(msg).not.toMatch(/MONNIFY_API_KEY/);
  });
});

describe('getMonnifyProvisionLoadingHint', () => {
  it('avoids infra copy in production', () => {
    const originalDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = false;
    expect(getMonnifyProvisionLoadingHint()).not.toMatch(/supabase/i);
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });
});
