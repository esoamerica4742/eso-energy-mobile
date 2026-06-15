import {
  friendlySendError,
  friendlyVerifyError,
  isRetryableVerifyError,
} from '@/lib/authOtpMessages';

describe('authOtpMessages', () => {
  it('maps rate limit on send', () => {
    expect(friendlySendError('Email rate limit exceeded')).toMatch(/Too many attempts/i);
  });

  it('maps invalid OTP on verify', () => {
    expect(friendlyVerifyError('Token has expired or is invalid')).toMatch(/doesn't match/i);
  });

  it('flags retryable verify errors', () => {
    expect(isRetryableVerifyError('Invalid OTP')).toBe(true);
    expect(isRetryableVerifyError('Account banned')).toBe(false);
  });
});
