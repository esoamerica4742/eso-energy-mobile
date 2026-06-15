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

/** Individual Eso Pay users are wallet owners when signed in. */
export function resolveEsoPayUserRole(input: {
  esoPaySignedIn: boolean;
  parentRole?: UserRole | null;
}): EsoPayUserRole {
  if (!input.esoPaySignedIn) return 'viewer';
  if (input.parentRole) return mapParentRoleToEsoPay(input.parentRole);
  return 'owner';
}
