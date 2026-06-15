import {
  isMonnifyAccountReady,
  maskMonnifyAccount,
  MONNIFY_ACCOUNT_MIN_LENGTH,
} from '@/esopay/lib/monnifyAccount';

describe('monnify helpers', () => {
  it('requires minimum digit length before validate', () => {
    expect(MONNIFY_ACCOUNT_MIN_LENGTH).toBe(6);
    expect(isMonnifyAccountReady('12345')).toBe(false);
    expect(isMonnifyAccountReady('123456')).toBe(true);
    expect(isMonnifyAccountReady('12-34-56-78')).toBe(true);
  });

  it('masks account numbers for display', () => {
    expect(maskMonnifyAccount('1234')).toBe('1234');
    expect(maskMonnifyAccount('4501234567')).toBe('****4567');
    expect(maskMonnifyAccount('  4501234567  ')).toBe('****4567');
  });
});
