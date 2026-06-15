import { paramString } from '@/lib/authRouteParams';

describe('paramString', () => {
  it('returns string values', () => {
    expect(paramString('esopay')).toBe('esopay');
  });

  it('unwraps array params', () => {
    expect(paramString(['first', 'second'])).toBe('first');
  });

  it('handles undefined', () => {
    expect(paramString(undefined)).toBe('');
  });
});
