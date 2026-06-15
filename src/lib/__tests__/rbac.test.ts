import {
  canCreateSites,
  canDismissAlerts,
  canExportReports,
  canLinkDevice,
  canManageApiKeys,
  canManageWorkspace,
} from '@/lib/monitoring/rbac';

describe('monitoring rbac', () => {
  it('grants workspace management to admins only', () => {
    expect(canManageWorkspace('admin')).toBe(true);
    expect(canManageWorkspace('technician')).toBe(false);
    expect(canManageWorkspace('viewer')).toBe(false);
  });

  it('allows technicians to link devices and export reports', () => {
    expect(canLinkDevice('technician')).toBe(true);
    expect(canExportReports('technician')).toBe(true);
    expect(canDismissAlerts('technician')).toBe(true);
    expect(canLinkDevice('viewer')).toBe(false);
  });

  it('restricts API keys and site creation to admins', () => {
    expect(canManageApiKeys('admin')).toBe(true);
    expect(canCreateSites('admin')).toBe(true);
    expect(canManageApiKeys('technician')).toBe(false);
    expect(canCreateSites('viewer')).toBe(false);
  });
});
