import * as SecureStore from 'expo-secure-store';

const memoryFallback = new Map<string, string>();

const SECURE_STORE_KEY_RE = /^[a-zA-Z0-9._-]+$/;

/** Expo SecureStore keys: non-empty, [A-Za-z0-9._-] only. */
export function toSecureStoreKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) {
    throw new Error('SecureStore key must not be empty');
  }
  if (SECURE_STORE_KEY_RE.test(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!normalized) {
    throw new Error('SecureStore key must not be empty after normalization');
  }
  return normalized;
}

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'eso-energy-mobile',
};

function supportsSecureStore(): boolean {
  return typeof SecureStore.isAvailableAsync === 'function';
}

async function available(): Promise<boolean> {
  if (!supportsSecureStore()) return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  const storeKey = toSecureStoreKey(key);
  if (await available()) {
    await SecureStore.setItemAsync(storeKey, value, SECURE_OPTIONS);
    return;
  }
  memoryFallback.set(storeKey, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  const storeKey = toSecureStoreKey(key);
  if (await available()) {
    return SecureStore.getItemAsync(storeKey, SECURE_OPTIONS);
  }
  return memoryFallback.get(storeKey) ?? null;
}

export async function removeSecureItem(key: string): Promise<void> {
  const storeKey = toSecureStoreKey(key);
  if (await available()) {
    await SecureStore.deleteItemAsync(storeKey, SECURE_OPTIONS);
    return;
  }
  memoryFallback.delete(storeKey);
}

export async function setSecureJson<T>(key: string, value: T): Promise<void> {
  await setSecureItem(key, JSON.stringify(value));
}

export async function getSecureJson<T>(key: string): Promise<T | null> {
  const raw = await getSecureItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export type SupabaseSecureStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export function createSupabaseSecureStorage(prefix = 'supabase'): SupabaseSecureStorage {
  const k = (key: string) => toSecureStoreKey(`${prefix}_${key}`);
  return {
    getItem: (key) => getSecureItem(k(key)),
    setItem: (key, value) => setSecureItem(k(key), value),
    removeItem: (key) => removeSecureItem(k(key)),
  };
}
