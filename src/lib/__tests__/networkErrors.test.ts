import { friendlyNetworkError, isNetworkFailure } from '@/lib/networkErrors';

describe('networkErrors', () => {
  it('maps UnknownHostException to friendly copy', () => {
    const msg = 'fetch failed: java.net.UnknownHostException: pndsuzscjedumjhadtio.supabase.co';
    expect(isNetworkFailure(msg)).toBe(true);
    expect(friendlyNetworkError(msg)).toContain('No connection to Eso Energy servers');
  });

  it('passes through unrelated errors', () => {
    expect(friendlyNetworkError('Invalid login credentials')).toBe('Invalid login credentials');
  });
});
