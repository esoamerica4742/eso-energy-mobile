import type { UserRole } from '@/stores/authStore';

export function canManageWorkspace(role: UserRole): boolean {
  return role === 'admin';
}

export function canLinkDevice(role: UserRole): boolean {
  return role === 'admin' || role === 'technician';
}

export function canDismissAlerts(role: UserRole): boolean {
  return role === 'admin' || role === 'technician';
}

export function canExportReports(role: UserRole): boolean {
  return role === 'admin' || role === 'technician';
}

export function canManageApiKeys(role: UserRole): boolean {
  return role === 'admin';
}

export function canCreateSites(role: UserRole): boolean {
  return role === 'admin';
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'technician':
      return 'Site manager';
    default:
      return 'Viewer';
  }
}
