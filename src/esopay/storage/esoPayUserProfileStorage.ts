import type { User } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'esopay-user-profile' });

export const ESO_PAY_USER_NAME_KEY = 'user_name';
export const ESO_PAY_USER_EMAIL_KEY = 'user_email';

export function persistEsoPayUserProfile(user: User | null): void {
  if (!user) {
    storage.remove(ESO_PAY_USER_NAME_KEY);
    storage.remove(ESO_PAY_USER_EMAIL_KEY);
    return;
  }

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  const name =
    meta?.full_name?.trim() ||
    meta?.name?.trim() ||
    user.email?.split('@')[0]?.trim() ||
    '';
  const email = user.email?.trim() || '';

  if (name) storage.set(ESO_PAY_USER_NAME_KEY, name);
  else storage.remove(ESO_PAY_USER_NAME_KEY);

  if (email) storage.set(ESO_PAY_USER_EMAIL_KEY, email);
  else storage.remove(ESO_PAY_USER_EMAIL_KEY);
}

export function getEsoPayUserName(): string | undefined {
  return storage.getString(ESO_PAY_USER_NAME_KEY);
}

export function getEsoPayUserEmail(): string | undefined {
  return storage.getString(ESO_PAY_USER_EMAIL_KEY);
}

export function clearEsoPayUserProfile(): void {
  storage.remove(ESO_PAY_USER_NAME_KEY);
  storage.remove(ESO_PAY_USER_EMAIL_KEY);
}

export function formatEsoPayFirstName(raw: string | undefined): string {
  if (!raw?.trim()) return 'there';
  const first = raw.trim().split(/\s+/)[0] ?? '';
  if (!first) return 'there';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function initialsFromName(name: string | undefined): string {
  if (!name?.trim()) return 'EP';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}
