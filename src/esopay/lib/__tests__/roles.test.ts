import { canInitiateEsoPayPayment, resolveEsoPayUserRole } from '@/esopay/context/roles';

describe('Eso Pay roles', () => {
  it('grants owner when signed into Eso Pay', () => {
    expect(resolveEsoPayUserRole({ esoPaySignedIn: true })).toBe('owner');
    expect(canInitiateEsoPayPayment(resolveEsoPayUserRole({ esoPaySignedIn: true }))).toBe(true);
  });

  it('defaults to viewer when not signed into Eso Pay', () => {
    expect(resolveEsoPayUserRole({ esoPaySignedIn: false })).toBe('viewer');
    expect(canInitiateEsoPayPayment(resolveEsoPayUserRole({ esoPaySignedIn: false }))).toBe(false);
  });
});
