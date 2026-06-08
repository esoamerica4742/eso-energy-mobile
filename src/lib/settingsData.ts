import type { UserRole } from '@/stores/authStore';

export type SettingsConnectionStatus = 'live' | 'degraded' | 'offline';

export type SettingsSnapshot = {
  displayName: string;
  email: string;
  initials: string;
  companyName: string;
  roleLabel: string;
  siteCount: number;
  connectionStatus: SettingsConnectionStatus;
  connectionLabel: string;
  isAuthenticated: boolean;
  isDemoMode: boolean;
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrator',
  technician: 'Technician',
  viewer: 'Viewer',
};

export function formatRoleLabel(role: UserRole | null | undefined) {
  if (!role) return 'Operator';
  return ROLE_LABEL[role] ?? 'Operator';
}

export function profileInitials(name: string, email?: string | null) {
  const source = name.trim() || email?.split('@')[0] || 'ES';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function buildSettingsSnapshot(input: {
  email?: string | null;
  companyName?: string | null;
  role?: UserRole | null;
  siteCount: number;
  supabaseConfigured: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}): SettingsSnapshot {
  const email = input.email ?? 'operator@eso.energy';
  const companyName = input.companyName ?? (input.isDemoMode ? 'ESO Energy Demo' : 'Workspace');
  const displayName = input.isDemoMode
    ? 'Demo Operator'
    : email.includes('@')
      ? email.split('@')[0].replace(/[._-]/g, ' ')
      : 'Operator';

  const connectionStatus: SettingsConnectionStatus = !input.supabaseConfigured
    ? 'offline'
    : input.isAuthenticated || input.isDemoMode
      ? 'live'
      : 'degraded';

  const connectionLabel = !input.supabaseConfigured
    ? 'Offline'
    : input.isDemoMode
      ? 'Demo fleet'
      : input.isAuthenticated
        ? 'Connected'
        : 'Guest';

  return {
    displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    email: input.isDemoMode ? 'demo@eso.energy' : email,
    initials: profileInitials(displayName, email),
    companyName,
    roleLabel: input.isDemoMode ? 'Demo access' : formatRoleLabel(input.role),
    siteCount: input.siteCount,
    connectionStatus,
    connectionLabel,
    isAuthenticated: input.isAuthenticated,
    isDemoMode: input.isDemoMode,
  };
}
