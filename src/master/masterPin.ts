import * as Crypto from 'expo-crypto';
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/secureStorage';
import { MASTER_PIN_LENGTH, MASTER_PIN_STORAGE_PREFIX } from '@/master/constants';

const STORAGE_SEP = '|';

function pinKey(userId: string): string {
  return `${MASTER_PIN_STORAGE_PREFIX}${userId}`;
}

async function hashPin(pin: string, salt: string, sep: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}${sep}${pin}`);
}

export async function hasMasterPin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const stored = await getSecureItem(pinKey(userId));
  return Boolean(stored?.includes(STORAGE_SEP) || stored?.includes(':'));
}

export async function setMasterPin(userId: string, pin: string): Promise<void> {
  if (!userId) throw new Error('User required to set PIN');
  const normalized = pin.replace(/\D/g, '');
  if (normalized.length !== MASTER_PIN_LENGTH) {
    throw new Error(`PIN must be exactly ${MASTER_PIN_LENGTH} digits`);
  }

  const salt = Crypto.randomUUID();
  const digest = await hashPin(normalized, salt, STORAGE_SEP);
  await setSecureItem(pinKey(userId), `${salt}${STORAGE_SEP}${digest}`);
}

export async function verifyMasterPin(userId: string, pin: string): Promise<boolean> {
  if (!userId) return false;
  const normalized = pin.replace(/\D/g, '');
  if (normalized.length !== MASTER_PIN_LENGTH) return false;

  const stored = await getSecureItem(pinKey(userId));
  if (!stored) return false;

  const sep = stored.includes(STORAGE_SEP) ? STORAGE_SEP : ':';
  const sepIndex = stored.indexOf(sep);
  if (sepIndex < 0) return false;

  const salt = stored.slice(0, sepIndex);
  const digest = stored.slice(sepIndex + 1);
  if (!salt || !digest) return false;

  const candidate = await hashPin(normalized, salt, sep);
  return candidate === digest;
}

export async function clearMasterPin(userId: string): Promise<void> {
  if (!userId) return;
  await removeSecureItem(pinKey(userId));
}
