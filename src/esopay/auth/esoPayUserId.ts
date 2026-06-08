import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/secureStorage';

const USER_ID_KEY = 'esopay_user_id';

export async function persistEsoPayUserId(userId: string): Promise<void> {
  if (!userId) return;
  await setSecureItem(USER_ID_KEY, userId);
}

export async function getPersistedEsoPayUserId(): Promise<string | null> {
  return getSecureItem(USER_ID_KEY);
}

export async function clearPersistedEsoPayUserId(): Promise<void> {
  await removeSecureItem(USER_ID_KEY);
}
