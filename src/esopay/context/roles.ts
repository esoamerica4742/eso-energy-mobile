import type { EsoPayUserRole } from '@/esopay/context/types';
import type { UserRole } from '@/stores/authStore';

/** Maps parent-app tenant roles to Eso Pay RBAC (spec §2.2 / §2.6). */
export function mapParentRoleToEsoPay(parentRole: UserRole | null | undefined): EsoPayUserRole {
  switch (parentRole) {
    case 'admin':
      return 'owner';
    case 'technician':
      return 'admin';
    case 'viewer':
    default:
      return 'viewer';
  }
}

export function canInitiateEsoPayPayment(role: EsoPayUserRole): boolean {
  return role === 'owner' || role === 'admin';
}
