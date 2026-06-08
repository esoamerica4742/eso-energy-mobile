import { buildSettingsSnapshot, formatRoleLabel, profileInitials } from '@/lib/settingsData';

describe('settingsData', () => {
  it('formats role labels', () => {
    expect(formatRoleLabel('admin')).toBe('Administrator');
    expect(formatRoleLabel('technician')).toBe('Technician');
  });

  it('derives profile initials', () => {
    expect(profileInitials('Jane Doe')).toBe('JD');
    expect(profileInitials('', 'alex@eso.energy')).toBe('AL');
  });

  it('builds settings snapshot for authenticated user', () => {
    const snapshot = buildSettingsSnapshot({
      email: 'ops@eso.energy',
      companyName: 'ESO Energy',
      role: 'admin',
      siteCount: 3,
      supabaseConfigured: true,
      isAuthenticated: true,
      isDemoMode: false,
    });

    expect(snapshot.companyName).toBe('ESO Energy');
    expect(snapshot.roleLabel).toBe('Administrator');
    expect(snapshot.connectionStatus).toBe('live');
    expect(snapshot.siteCount).toBe(3);
  });

  it('builds demo snapshot when demo mode is active', () => {
    const snapshot = buildSettingsSnapshot({
      siteCount: 2,
      supabaseConfigured: true,
      isAuthenticated: false,
      isDemoMode: true,
    });

    expect(snapshot.isDemoMode).toBe(true);
    expect(snapshot.email).toBe('demo@eso.energy');
    expect(snapshot.connectionLabel).toBe('Demo fleet');
  });
});
