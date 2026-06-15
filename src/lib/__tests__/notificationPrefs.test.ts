import { shouldShowMonitoringAlert } from '@/lib/monitoring/notificationPrefs';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () =>
    JSON.stringify({
      criticalEnabled: true,
      warningEnabled: true,
      infoEnabled: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      timezone: 'Africa/Lagos',
    }),
  ),
  setItem: jest.fn(async () => undefined),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  supabaseConfigured: false,
}));

describe('notificationPrefs', () => {
  it('allows critical alerts by default', async () => {
    await expect(shouldShowMonitoringAlert('critical')).resolves.toBe(true);
  });

  it('blocks info alerts by default', async () => {
    await expect(shouldShowMonitoringAlert('info')).resolves.toBe(false);
  });
});
