import { mapSiteCreateError } from '@/lib/monitoring/siteCreateErrors';

describe('mapSiteCreateError', () => {
  it('maps current_company_id grant errors', () => {
    expect(
      mapSiteCreateError('permission denied for function current_company_id'),
    ).toMatch(/database migration/i);
  });

  it('maps RLS admin errors', () => {
    expect(mapSiteCreateError('new row violates row-level security policy')).toMatch(
      /administrators/i,
    );
  });

  it('passes through unknown errors', () => {
    expect(mapSiteCreateError('Network timeout')).toBe('Network timeout');
  });
});
