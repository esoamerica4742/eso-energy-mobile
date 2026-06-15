import * as Crypto from 'expo-crypto';
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/secureStorage';

const PIN_KEY_PREFIX = 'esopay_tx_pin_';
const LEGACY_PIN_KEY_PREFIX = 'esopay.tx_pin.';
export const TRANSACTION_PIN_LENGTH = 6;
const STORAGE_SEP = '|';

function pinKey(userId: string): string {
  return `${PIN_KEY_PREFIX}${userId}`;
}

function legacyPinKey(userId: string): string {
  return `${LEGACY_PIN_KEY_PREFIX}${userId}`;
}

async function readStoredPinRecord(userId: string): Promise<string | null> {
  return (await getSecureItem(pinKey(userId))) ?? (await getSecureItem(legacyPinKey(userId)));
}

async function hashPin(pin: string, salt: string, sep: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}${sep}${pin}`);
}

export async function hasTransactionPin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const stored = await readStoredPinRecord(userId);
  return Boolean(stored && (stored.includes(STORAGE_SEP) || stored.includes(':')));
}

export async function setTransactionPin(userId: string, pin: string): Promise<void> {
  if (!userId) throw new Error('User required to set transaction PIN');
  const normalized = pin.replace(/\D/g, '');
  if (normalized.length !== TRANSACTION_PIN_LENGTH) {
    throw new Error('PIN must be exactly 6 digits');
  }

  const salt = Crypto.randomUUID();
  const digest = await hashPin(normalized, salt, STORAGE_SEP);
  await setSecureItem(pinKey(userId), `${salt}${STORAGE_SEP}${digest}`);
  await removeSecureItem(legacyPinKey(userId));
}

export async function verifyTransactionPin(userId: string, pin: string): Promise<boolean> {
  if (!userId) return false;
  const normalized = pin.replace(/\D/g, '');
  if (normalized.length !== TRANSACTION_PIN_LENGTH) return false;

  const stored = await readStoredPinRecord(userId);
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

export async function clearTransactionPin(userId: string): Promise<void> {
  if (!userId) return;
  await removeSecureItem(pinKey(userId));
  await removeSecureItem(legacyPinKey(userId));
}
